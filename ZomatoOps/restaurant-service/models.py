from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime
from enum import Enum


class CategoryEnum(str, Enum):
    dining = "dining"
    nightlife = "nightlife"
    cafes = "cafes"
    delivery = "delivery"


class PriceRange(str, Enum):
    budget = "budget"        # $
    moderate = "moderate"    # $$
    expensive = "expensive"  # $$$
    luxury = "luxury"        # $$$$


class Location(BaseModel):
    address: str
    city: str
    state: str
    zip_code: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class OperatingHours(BaseModel):
    monday: Optional[str] = "09:00-22:00"
    tuesday: Optional[str] = "09:00-22:00"
    wednesday: Optional[str] = "09:00-22:00"
    thursday: Optional[str] = "09:00-22:00"
    friday: Optional[str] = "09:00-23:00"
    saturday: Optional[str] = "09:00-23:00"
    sunday: Optional[str] = "10:00-21:00"


# ── Restaurant ────────────────────────────────────────────────────────────────

class RestaurantCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    description: Optional[str] = None
    category: CategoryEnum
    cuisine_types: List[str] = []
    price_range: PriceRange = PriceRange.moderate
    location: Location
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    cover_image_url: Optional[str] = None
    photos: List[str] = []
    features: List[str] = []   # e.g. ["WiFi", "Parking", "Outdoor Seating"]
    operating_hours: Optional[OperatingHours] = None


class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[CategoryEnum] = None
    cuisine_types: Optional[List[str]] = None
    price_range: Optional[PriceRange] = None
    location: Optional[Location] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    cover_image_url: Optional[str] = None
    photos: Optional[List[str]] = None
    features: Optional[List[str]] = None
    operating_hours: Optional[OperatingHours] = None
    is_active: Optional[bool] = None


class RestaurantResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    category: str
    cuisine_types: List[str]
    price_range: str
    location: Location
    phone: Optional[str]
    email: Optional[str]
    website: Optional[str]
    cover_image_url: Optional[str]
    photos: List[str]
    features: List[str]
    operating_hours: Optional[OperatingHours]
    average_rating: float = 0.0
    total_reviews: int = 0
    owner_id: Optional[str]
    is_active: bool
    created_at: datetime


# ── Menu ──────────────────────────────────────────────────────────────────────

class MenuItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    category: str  # e.g. "Starters", "Main Course", "Drinks"
    image_url: Optional[str] = None
    is_vegetarian: bool = False
    is_vegan: bool = False
    is_available: bool = True
    allergens: List[str] = []


class MenuItemResponse(BaseModel):
    id: str
    restaurant_id: str
    name: str
    description: Optional[str]
    price: float
    category: str
    image_url: Optional[str]
    is_vegetarian: bool
    is_vegan: bool
    is_available: bool
    allergens: List[str]
    created_at: datetime


# ── Review ────────────────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = None
    body: str = Field(..., min_length=10, max_length=1000)
    photos: List[str] = []
    visit_type: Optional[str] = None  # "dine-in", "delivery", "takeaway"


class ReviewResponse(BaseModel):
    id: str
    restaurant_id: str
    user_id: str
    user_name: str
    rating: int
    title: Optional[str]
    body: str
    photos: List[str]
    visit_type: Optional[str]
    helpful_votes: int = 0
    created_at: datetime


# ── Photo ─────────────────────────────────────────────────────────────────────

class PhotoAdd(BaseModel):
    url: str
    caption: Optional[str] = None
    tag: Optional[str] = None  # "food", "interior", "exterior", "menu"
