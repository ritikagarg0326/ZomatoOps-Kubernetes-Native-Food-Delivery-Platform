from motor.motor_asyncio import AsyncIOMotorClient
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongodb_url: str = "mongodb://mongodb-user:27017"
    database_name: str = "user_db"
    secret_key: str = "zomato-super-secret-key-change-in-production-2024"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours

    class Config:
        env_file = ".env"


settings = Settings()

client = AsyncIOMotorClient(settings.mongodb_url)
database = client[settings.database_name]

users_collection = database.get_collection("users")


async def create_indexes():
    await users_collection.create_index("email", unique=True)
    await users_collection.create_index("phone")
