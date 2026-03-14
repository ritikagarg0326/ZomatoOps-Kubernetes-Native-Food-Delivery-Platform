from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
from datetime import datetime
from typing import List, Optional
from jose import JWTError, jwt
from bson import ObjectId

from database import settings, orders_collection, carts_collection, create_indexes
from models import (
    CartUpsert, CartResponse, CartItemResponse,
    OrderCreate, OrderResponse, CartItemIn, OrderStatus
)

security = HTTPBearer()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_indexes()
    yield


app = FastAPI(title="Order Service", version="1.0.0", lifespan=lifespan)


# ── helpers ───────────────────────────────────────────────────────────────────

DELIVERY_FEE = 40.0
TAX_RATE = 0.05
FREE_DELIVERY_THRESHOLD = 500.0


def serialize_doc(doc: dict) -> dict:
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc


def calculate_totals(items: List[CartItemIn], delivery_type: str = "delivery", coupon_code: Optional[str] = None):
    subtotal = sum(i.price * i.quantity for i in items)
    delivery_fee = 0.0 if (delivery_type != "delivery" or subtotal >= FREE_DELIVERY_THRESHOLD) else DELIVERY_FEE
    taxes = round(subtotal * TAX_RATE, 2)
    discount = 0.0
    if coupon_code and coupon_code.upper() == "WELCOME50":
        discount = min(subtotal * 0.5, 100.0)
    total = round(subtotal + delivery_fee + taxes - discount, 2)
    return subtotal, delivery_fee, taxes, discount, total


def build_item_responses(items: List[CartItemIn]) -> List[CartItemResponse]:
    return [
        CartItemResponse(
            item_id=i.item_id,
            name=i.name,
            price=i.price,
            quantity=i.quantity,
            image_url=i.image_url,
            special_instructions=i.special_instructions,
            subtotal=round(i.price * i.quantity, 2)
        ) for i in items
    ]


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(
            credentials.credentials, settings.secret_key,
            algorithms=[settings.algorithm]
        )
        user_id: str = payload.get("sub")
        if not user_id:
            raise credentials_exception
        return {"user_id": user_id, "email": payload.get("email")}
    except JWTError:
        raise credentials_exception


# ── health ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "order-service"}


# ── cart ──────────────────────────────────────────────────────────────────────

@app.get("/cart", response_model=Optional[CartResponse])
async def get_cart(current_user: dict = Depends(get_current_user)):
    cart = await carts_collection.find_one({"user_id": current_user["user_id"]})
    if not cart:
        return None
    items_in = [CartItemIn(**i) for i in cart["items"]]
    subtotal, delivery_fee, taxes, _, total = calculate_totals(items_in)
    cart["subtotal"] = subtotal
    cart["delivery_fee"] = delivery_fee
    cart["taxes"] = taxes
    cart["total"] = total
    cart["items"] = build_item_responses(items_in)
    return CartResponse(**serialize_doc(cart))


@app.put("/cart", response_model=CartResponse)
async def upsert_cart(data: CartUpsert, current_user: dict = Depends(get_current_user)):
    items_in = data.items
    subtotal, delivery_fee, taxes, _, total = calculate_totals(items_in)

    cart_doc = {
        "user_id": current_user["user_id"],
        "restaurant_id": data.restaurant_id,
        "restaurant_name": data.restaurant_name,
        "items": [i.model_dump() for i in items_in],
        "subtotal": subtotal,
        "delivery_fee": delivery_fee,
        "taxes": taxes,
        "total": total,
        "updated_at": datetime.utcnow(),
    }

    result = await carts_collection.find_one_and_update(
        {"user_id": current_user["user_id"]},
        {"$set": cart_doc},
        upsert=True,
        return_document=True
    )
    if not result:
        result = await carts_collection.find_one({"user_id": current_user["user_id"]})

    result["items"] = build_item_responses(items_in)
    return CartResponse(**serialize_doc(result))


@app.delete("/cart", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(current_user: dict = Depends(get_current_user)):
    await carts_collection.delete_one({"user_id": current_user["user_id"]})


# ── orders ────────────────────────────────────────────────────────────────────

@app.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def place_order(data: OrderCreate, current_user: dict = Depends(get_current_user)):
    if not data.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")
    if data.delivery_type == "delivery" and not data.delivery_address:
        raise HTTPException(status_code=400, detail="Delivery address required for delivery orders")

    subtotal, delivery_fee, taxes, discount, total = calculate_totals(
        data.items, data.delivery_type, data.coupon_code
    )

    order_doc = {
        "user_id": current_user["user_id"],
        "restaurant_id": data.restaurant_id,
        "restaurant_name": data.restaurant_name,
        "items": [i.model_dump() for i in data.items],
        "delivery_type": data.delivery_type,
        "delivery_address": data.delivery_address.model_dump() if data.delivery_address else None,
        "special_instructions": data.special_instructions,
        "payment_method": data.payment_method,
        "subtotal": subtotal,
        "delivery_fee": delivery_fee,
        "taxes": taxes,
        "discount": discount,
        "total": total,
        "status": OrderStatus.confirmed,
        "estimated_delivery_mins": 35 if data.delivery_type == "delivery" else 15,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await orders_collection.insert_one(order_doc)
    order_doc["_id"] = result.inserted_id

    # Clear cart after successful order
    await carts_collection.delete_one({"user_id": current_user["user_id"]})

    order_doc["items"] = build_item_responses(data.items)
    return OrderResponse(**serialize_doc(order_doc))


@app.get("/", response_model=List[OrderResponse])
async def get_order_history(
    current_user: dict = Depends(get_current_user),
    skip: int = 0,
    limit: int = 20
):
    cursor = orders_collection.find({"user_id": current_user["user_id"]}).sort("created_at", -1).skip(skip).limit(limit)
    orders = await cursor.to_list(limit)
    results = []
    for o in orders:
        items_in = [CartItemIn(**i) for i in o["items"]]
        o["items"] = build_item_responses(items_in)
        results.append(OrderResponse(**serialize_doc(o)))
    return results


@app.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")
    order = await orders_collection.find_one({
        "_id": ObjectId(order_id),
        "user_id": current_user["user_id"]
    })
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    items_in = [CartItemIn(**i) for i in order["items"]]
    order["items"] = build_item_responses(items_in)
    return OrderResponse(**serialize_doc(order))


@app.patch("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(order_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")
    order = await orders_collection.find_one({
        "_id": ObjectId(order_id),
        "user_id": current_user["user_id"]
    })
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order["status"] not in [OrderStatus.pending, OrderStatus.confirmed]:
        raise HTTPException(status_code=400, detail="Order cannot be cancelled at this stage")

    await orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": OrderStatus.cancelled, "updated_at": datetime.utcnow()}}
    )
    order["status"] = OrderStatus.cancelled
    order["updated_at"] = datetime.utcnow()
    items_in = [CartItemIn(**i) for i in order["items"]]
    order["items"] = build_item_responses(items_in)
    return OrderResponse(**serialize_doc(order))
