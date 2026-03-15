from motor.motor_asyncio import AsyncIOMotorClient
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongodb_url: str = "mongodb://mongodb-order:27017"
    database_name: str = "order_db"
    secret_key: str = "zomato-super-secret-key-change-in-production-2024"
    algorithm: str = "HS256"
    restaurant_service_url: str = "http://restaurant-service:8002"

    class Config:
        env_file = ".env"


settings = Settings()

client = AsyncIOMotorClient(settings.mongodb_url)
database = client[settings.database_name]

orders_collection = database.get_collection("orders")
carts_collection = database.get_collection("carts")


async def create_indexes():
    await orders_collection.create_index("user_id")
    await orders_collection.create_index("restaurant_id")
    await orders_collection.create_index("status")
    await carts_collection.create_index([("user_id", 1), ("restaurant_id", 1)])
