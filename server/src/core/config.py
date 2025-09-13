import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    API_TITLE: str = 'Knock Bank API'
    DOCS_URL: str = '/api/docs'
    DESCRIPTION: str = 'API to manage bank transactions for Knock Bank' # Translated

    SHOW_SQL: bool = os.getenv('SHOW_SQL', 'False').lower() in ('true', '1', 't')

    # CORRECTED: The attribute name now matches the environment variable.
    SQLALCHEMY_DATABASE_URI: str = os.getenv('SQLALCHEMY_DATABASE_URI')

    # JWT
    ALGORITHM: str = 'HS256'
    TOKEN_SECRET: str = os.getenv('TOKEN_SECRET')
    EXPIRATION_SECONDS: int = 60 * 60 * 5  # 5 Hours

settings = Settings()