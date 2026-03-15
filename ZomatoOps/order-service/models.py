from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class OrderStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    preparing = "preparing"
    out_for_delivery = "out_for_delivery"
    delivered = "delivered"
    cancelled = "cancelled"


class DeliveryType(str, Enum):
    delivery = "delivery"
    pickup = "pickup"
    dine_in = "dine_in"


class CartItemIn(BaseModel):
    item_id: str
    name: str
    price: float = Field(..., gt=0)
    quantity: int = Field(..., ge=1)
    image_url: Optional[str] = None
    special_instructions: Optional[str] = None


class CartUpsert(BaseModel):
    restaurant_id: str
    restaurant_name: str
    items: List[CartItemIn]


class CartItemResponse(BaseModel):
    item_id: str
    name: str
    price: float
    quantity: int
    image_url: Optional[str]
    special_instructions: Optional[str]
    subtotal: float


class CartResponse(BaseModel):
    id: str
    user_id: str
    restaurant_id: str
    restaurant_name: str
    items: List[CartItemResponse]
    subtotal: float
    delivery_fee: float
    taxes: float
    total: float
    updated_at: datetime


class DeliveryAddress(BaseModel):
    full_name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    zip_code: str


class OrderCreate(BaseModel):
    restaurant_id: str
    restaurant_name: str
    items: List[CartItemIn]
    delivery_type: DeliveryType = DeliveryType.delivery
    delivery_address: Optional[DeliveryAddress] = None
    special_instructions: Optional[str] = None
    coupon_code: Optional[str] = None
    payment_method: str = "cash_on_delivery"


class OrderResponse(BaseModel):
    id: str
    user_id: str
    restaurant_id: str
    restaurant_name: str
    items: List[CartItemResponse]
    delivery_type: str
    delivery_address: Optional[DeliveryAddress]
    special_instructions: Optional[str]
    payment_method: str
    subtotal: float
    delivery_fee: float
    taxes: float
    discount: float
    total: float
    status: str
    estimated_delivery_mins: Optional[int]
    created_at: datetime
    updated_at: datetime
