from motor.motor_asyncio import AsyncIOMotorClient
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongodb_url: str = "mongodb://mongodb-restaurant:27017"
    database_name: str = "restaurant_db"
    secret_key: str = "zomato-super-secret-key-change-in-production-2024"
    algorithm: str = "HS256"
    user_service_url: str = "http://user-service:8001"

    class Config:
        env_file = ".env"


settings = Settings()

client = AsyncIOMotorClient(settings.mongodb_url)
database = client[settings.database_name]

restaurants_collection = database.get_collection("restaurants")
reviews_collection = database.get_collection("reviews")
menus_collection = database.get_collection("menus")


async def create_indexes():
    await restaurants_collection.create_index("category")
    await restaurants_collection.create_index("city")
    await restaurants_collection.create_index([("name", "text"), ("cuisine_types", "text")])
    await reviews_collection.create_index("restaurant_id")
    await menus_collection.create_index("restaurant_id")
