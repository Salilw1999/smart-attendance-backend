from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()  # this makes sure .env is read

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL")

settings = Settings()
