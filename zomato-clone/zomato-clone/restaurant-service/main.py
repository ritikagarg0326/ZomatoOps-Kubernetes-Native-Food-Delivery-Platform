from fastapi import FastAPI, HTTPException, Depends, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional, List
from jose import JWTError, jwt
from bson import ObjectId
import httpx

from database import settings, restaurants_collection, reviews_collection, menus_collection, create_indexes
from models import (
    RestaurantCreate, RestaurantUpdate, RestaurantResponse,
    MenuItemCreate, MenuItemResponse,
    ReviewCreate, ReviewResponse,
    PhotoAdd, CategoryEnum
)

security = HTTPBearer(auto_error=False)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_indexes()
    await seed_sample_data()
    yield


app = FastAPI(title="Restaurant Service", version="1.0.0", lifespan=lifespan)


# ── helpers ───────────────────────────────────────────────────────────────────

def serialize_doc(doc: dict) -> dict:
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        payload = jwt.decode(
            credentials.credentials, settings.secret_key,
            algorithms=[settings.algorithm]
        )
        return {"user_id": payload.get("sub"), "email": payload.get("email")}
    except JWTError:
        return None


async def require_auth(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user


async def update_restaurant_rating(restaurant_id: str):
    pipeline = [
        {"$match": {"restaurant_id": restaurant_id}},
        {"$group": {"_id": None, "avg": {"$avg": "$rating"}, "count": {"$sum": 1}}}
    ]
    result = await reviews_collection.aggregate(pipeline).to_list(1)
    if result:
        await restaurants_collection.update_one(
            {"_id": ObjectId(restaurant_id)},
            {"$set": {"average_rating": round(result[0]["avg"], 1), "total_reviews": result[0]["count"]}}
        )


async def seed_sample_data():
    count = await restaurants_collection.count_documents({})
    if count > 0:
        return

    sample_restaurants = [
        {
            "name": "The Grand Spice Kitchen",
            "description": "Authentic Indian cuisine with a modern twist. Experience the rich flavors of India in a contemporary setting.",
            "category": "dining",
            "cuisine_types": ["Indian", "Mughlai", "North Indian"],
            "price_range": "moderate",
            "location": {"address": "12 MG Road", "city": "Bangalore", "state": "Karnataka", "zip_code": "560001", "latitude": 12.9716, "longitude": 77.5946},
            "phone": "+91-80-12345678",
            "email": "info@grandspice.com",
            "website": "https://grandspice.com",
            "cover_image_url": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
            "photos": [
                "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600",
                "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
                "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600"
            ],
            "features": ["WiFi", "Parking", "Air Conditioning", "Family Friendly", "Takeaway"],
            "operating_hours": {"monday": "12:00-23:00", "tuesday": "12:00-23:00", "wednesday": "12:00-23:00", "thursday": "12:00-23:00", "friday": "12:00-00:00", "saturday": "11:00-00:00", "sunday": "11:00-22:00"},
            "average_rating": 4.3,
            "total_reviews": 128,
            "owner_id": None,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Skybar Lounge",
            "description": "A rooftop nightlife destination offering premium cocktails with panoramic city views.",
            "category": "nightlife",
            "cuisine_types": ["Continental", "Bar Food", "Asian Fusion"],
            "price_range": "expensive",
            "location": {"address": "Level 22, Phoenix Mall", "city": "Mumbai", "state": "Maharashtra", "zip_code": "400001", "latitude": 19.0760, "longitude": 72.8777},
            "phone": "+91-22-98765432",
            "email": "reservations@skybar.com",
            "website": "https://skybarlounge.com",
            "cover_image_url": "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800",
            "photos": [
                "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600",
                "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600"
            ],
            "features": ["Rooftop", "Live Music", "Valet Parking", "Cocktail Bar", "DJ Nights"],
            "operating_hours": {"monday": "Closed", "tuesday": "Closed", "wednesday": "19:00-02:00", "thursday": "19:00-02:00", "friday": "19:00-03:00", "saturday": "18:00-03:00", "sunday": "18:00-01:00"},
            "average_rating": 4.6,
            "total_reviews": 89,
            "owner_id": None,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Pasta Paradise",
            "description": "Authentic Italian restaurant bringing the finest pasta and pizza recipes straight from Naples.",
            "category": "dining",
            "cuisine_types": ["Italian", "Pizza", "Pasta"],
            "price_range": "moderate",
            "location": {"address": "5 Connaught Place", "city": "Delhi", "state": "Delhi", "zip_code": "110001", "latitude": 28.6315, "longitude": 77.2167},
            "phone": "+91-11-55566677",
            "email": "hello@pastaparadise.in",
            "website": None,
            "cover_image_url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
            "photos": [
                "https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=600",
                "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600"
            ],
            "features": ["WiFi", "Takeaway", "Outdoor Seating", "Delivery"],
            "operating_hours": {"monday": "11:00-22:00", "tuesday": "11:00-22:00", "wednesday": "11:00-22:00", "thursday": "11:00-22:00", "friday": "11:00-23:00", "saturday": "10:00-23:00", "sunday": "10:00-21:00"},
            "average_rating": 4.1,
            "total_reviews": 203,
            "owner_id": None,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": "The Craft Beer Garden",
            "description": "Chill outdoor beer garden featuring 30+ craft beers on tap and hearty bar bites.",
            "category": "nightlife",
            "cuisine_types": ["American", "Bar Food", "Burgers"],
            "price_range": "moderate",
            "location": {"address": "77 Koregaon Park", "city": "Pune", "state": "Maharashtra", "zip_code": "411001", "latitude": 18.5362, "longitude": 73.8955},
            "phone": "+91-20-33344455",
            "email": "cheers@craftbeergarden.in",
            "website": "https://craftbeergarden.in",
            "cover_image_url": "https://images.unsplash.com/photo-1559818488-a1f4f6d48519?w=800",
            "photos": [
                "https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=600",
                "https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=600"
            ],
            "features": ["Outdoor Seating", "Live Sports", "Pet Friendly", "Happy Hours"],
            "operating_hours": {"monday": "Closed", "tuesday": "17:00-01:00", "wednesday": "17:00-01:00", "thursday": "17:00-01:00", "friday": "16:00-02:00", "saturday": "14:00-02:00", "sunday": "14:00-00:00"},
            "average_rating": 4.4,
            "total_reviews": 67,
            "owner_id": None,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Sushi Zen",
            "description": "Premium Japanese dining experience with omakase options and a traditional sake bar.",
            "category": "dining",
            "cuisine_types": ["Japanese", "Sushi", "Asian"],
            "price_range": "luxury",
            "location": {"address": "3 Jubilee Hills", "city": "Hyderabad", "state": "Telangana", "zip_code": "500033", "latitude": 17.4318, "longitude": 78.4111},
            "phone": "+91-40-77788899",
            "email": "reservations@sushizen.in",
            "website": "https://sushizen.in",
            "cover_image_url": "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800",
            "photos": [
                "https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=600",
                "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600"
            ],
            "features": ["Reservations Required", "Private Dining", "Sake Bar", "Valet Parking"],
            "operating_hours": {"monday": "Closed", "tuesday": "18:00-23:00", "wednesday": "18:00-23:00", "thursday": "18:00-23:00", "friday": "18:00-00:00", "saturday": "17:00-00:00", "sunday": "17:00-22:00"},
            "average_rating": 4.8,
            "total_reviews": 156,
            "owner_id": None,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
    ]

    result = await restaurants_collection.insert_many(sample_restaurants)

    # Seed menus for first restaurant
    first_id = str(result.inserted_ids[0])
    sample_menu = [
        {"restaurant_id": first_id, "name": "Chicken Tikka Masala", "description": "Tender chicken in rich tomato-cream sauce", "price": 320, "category": "Main Course", "image_url": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400", "is_vegetarian": False, "is_vegan": False, "is_available": True, "allergens": ["dairy"], "created_at": datetime.utcnow()},
        {"restaurant_id": first_id, "name": "Paneer Butter Masala", "description": "Soft paneer cubes in velvety butter tomato gravy", "price": 280, "category": "Main Course", "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400", "is_vegetarian": True, "is_vegan": False, "is_available": True, "allergens": ["dairy"], "created_at": datetime.utcnow()},
        {"restaurant_id": first_id, "name": "Veg Samosa (4 pcs)", "description": "Crispy pastry filled with spiced potatoes and peas", "price": 120, "category": "Starters", "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400", "is_vegetarian": True, "is_vegan": True, "is_available": True, "allergens": ["gluten"], "created_at": datetime.utcnow()},
        {"restaurant_id": first_id, "name": "Mango Lassi", "description": "Chilled yoghurt drink blended with fresh Alphonso mango", "price": 120, "category": "Drinks", "image_url": "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400", "is_vegetarian": True, "is_vegan": False, "is_available": True, "allergens": ["dairy"], "created_at": datetime.utcnow()},
        {"restaurant_id": first_id, "name": "Garlic Naan", "description": "Soft leavened bread topped with garlic and butter", "price": 60, "category": "Breads", "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400", "is_vegetarian": True, "is_vegan": False, "is_available": True, "allergens": ["gluten", "dairy"], "created_at": datetime.utcnow()},
        {"restaurant_id": first_id, "name": "Gulab Jamun", "description": "Soft milk-solid dumplings soaked in rose sugar syrup", "price": 100, "category": "Desserts", "image_url": "https://images.unsplash.com/photo-1666664000668-d66b8da4af14?w=400", "is_vegetarian": True, "is_vegan": False, "is_available": True, "allergens": ["dairy", "gluten"], "created_at": datetime.utcnow()},
    ]
    await menus_collection.insert_many(sample_menu)


# ── health ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "restaurant-service"}


# ── restaurants ───────────────────────────────────────────────────────────────

@app.get("/", response_model=List[RestaurantResponse])
async def list_restaurants(
    category: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    price_range: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    query: dict = {"is_active": True}
    if category:
        query["category"] = category
    if city:
        query["location.city"] = {"$regex": city, "$options": "i"}
    if search:
        query["$text"] = {"$search": search}
    if price_range:
        query["price_range"] = price_range

    cursor = restaurants_collection.find(query).skip(skip).limit(limit)
    restaurants = await cursor.to_list(limit)
    return [RestaurantResponse(**serialize_doc(r)) for r in restaurants]


@app.post("/", response_model=RestaurantResponse, status_code=status.HTTP_201_CREATED)
async def create_restaurant(
    data: RestaurantCreate,
    current_user: dict = Depends(require_auth)
):
    doc = data.model_dump()
    doc["owner_id"] = current_user["user_id"]
    doc["average_rating"] = 0.0
    doc["total_reviews"] = 0
    doc["is_active"] = True
    doc["created_at"] = datetime.utcnow()

    result = await restaurants_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return RestaurantResponse(**serialize_doc(doc))


@app.get("/{restaurant_id}", response_model=RestaurantResponse)
async def get_restaurant(restaurant_id: str):
    if not ObjectId.is_valid(restaurant_id):
        raise HTTPException(status_code=400, detail="Invalid restaurant ID")
    r = await restaurants_collection.find_one({"_id": ObjectId(restaurant_id)})
    if not r:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return RestaurantResponse(**serialize_doc(r))


@app.put("/{restaurant_id}", response_model=RestaurantResponse)
async def update_restaurant(
    restaurant_id: str,
    data: RestaurantUpdate,
    current_user: dict = Depends(require_auth)
):
    if not ObjectId.is_valid(restaurant_id):
        raise HTTPException(status_code=400, detail="Invalid restaurant ID")
    r = await restaurants_collection.find_one({"_id": ObjectId(restaurant_id)})
    if not r:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if r.get("owner_id") != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
    await restaurants_collection.update_one({"_id": ObjectId(restaurant_id)}, {"$set": update_dict})
    updated = await restaurants_collection.find_one({"_id": ObjectId(restaurant_id)})
    return RestaurantResponse(**serialize_doc(updated))


@app.delete("/{restaurant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_restaurant(
    restaurant_id: str,
    current_user: dict = Depends(require_auth)
):
    if not ObjectId.is_valid(restaurant_id):
        raise HTTPException(status_code=400, detail="Invalid restaurant ID")
    r = await restaurants_collection.find_one({"_id": ObjectId(restaurant_id)})
    if not r:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if r.get("owner_id") != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    await restaurants_collection.update_one({"_id": ObjectId(restaurant_id)}, {"$set": {"is_active": False}})


# ── photos ────────────────────────────────────────────────────────────────────

@app.post("/{restaurant_id}/photos", response_model=RestaurantResponse)
async def add_photo(
    restaurant_id: str,
    photo: PhotoAdd,
    current_user: dict = Depends(require_auth)
):
    if not ObjectId.is_valid(restaurant_id):
        raise HTTPException(status_code=400, detail="Invalid restaurant ID")
    await restaurants_collection.update_one(
        {"_id": ObjectId(restaurant_id)},
        {"$push": {"photos": photo.url}}
    )
    updated = await restaurants_collection.find_one({"_id": ObjectId(restaurant_id)})
    return RestaurantResponse(**serialize_doc(updated))


@app.get("/{restaurant_id}/photos")
async def get_photos(restaurant_id: str):
    if not ObjectId.is_valid(restaurant_id):
        raise HTTPException(status_code=400, detail="Invalid restaurant ID")
    r = await restaurants_collection.find_one({"_id": ObjectId(restaurant_id)}, {"photos": 1})
    if not r:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return {"photos": r.get("photos", [])}


# ── menus ─────────────────────────────────────────────────────────────────────

@app.get("/{restaurant_id}/menu", response_model=List[MenuItemResponse])
async def get_menu(restaurant_id: str):
    cursor = menus_collection.find({"restaurant_id": restaurant_id})
    items = await cursor.to_list(200)
    return [MenuItemResponse(**serialize_doc(i)) for i in items]


@app.post("/{restaurant_id}/menu", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
async def add_menu_item(
    restaurant_id: str,
    item: MenuItemCreate,
    current_user: dict = Depends(require_auth)
):
    doc = item.model_dump()
    doc["restaurant_id"] = restaurant_id
    doc["created_at"] = datetime.utcnow()
    result = await menus_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return MenuItemResponse(**serialize_doc(doc))


@app.delete("/{restaurant_id}/menu/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_menu_item(
    restaurant_id: str,
    item_id: str,
    current_user: dict = Depends(require_auth)
):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid item ID")
    await menus_collection.delete_one({"_id": ObjectId(item_id), "restaurant_id": restaurant_id})


# ── reviews ───────────────────────────────────────────────────────────────────

@app.get("/{restaurant_id}/reviews", response_model=List[ReviewResponse])
async def get_reviews(restaurant_id: str, skip: int = 0, limit: int = 20):
    cursor = reviews_collection.find({"restaurant_id": restaurant_id}).sort("created_at", -1).skip(skip).limit(limit)
    reviews = await cursor.to_list(limit)
    return [ReviewResponse(**serialize_doc(r)) for r in reviews]


@app.post("/{restaurant_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def add_review(
    restaurant_id: str,
    review: ReviewCreate,
    current_user: dict = Depends(require_auth)
):
    # Check for duplicate
    existing = await reviews_collection.find_one({
        "restaurant_id": restaurant_id,
        "user_id": current_user["user_id"]
    })
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this restaurant")

    doc = review.model_dump()
    doc["restaurant_id"] = restaurant_id
    doc["user_id"] = current_user["user_id"]
    doc["user_name"] = current_user.get("email", "Anonymous").split("@")[0]
    doc["helpful_votes"] = 0
    doc["created_at"] = datetime.utcnow()

    result = await reviews_collection.insert_one(doc)
    doc["_id"] = result.inserted_id

    await update_restaurant_rating(restaurant_id)
    return ReviewResponse(**serialize_doc(doc))
