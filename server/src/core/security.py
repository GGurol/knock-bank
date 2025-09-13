import jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Depends, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from passlib.context import CryptContext  # <-- 1. Import CryptContext

from core.config import settings
from core.db import get_db
from app.auth.models import User


# --- ADDED: Password Hashing Setup ---
# Create a CryptContext instance for hashing passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hashes a plain-text password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain-text password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)
# --- END of Password Hashing Setup ---


bearer_security = HTTPBearer()
bearer_security.auto_error = False


def encode_token(payload: dict) -> str:
    return jwt.encode(payload, settings.TOKEN_SECRET, settings.ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.TOKEN_SECRET, algorithms=[settings.ALGORITHM])


def create_token(user_id: int) -> str:
    initiated_at = datetime.now(timezone.utc)
    expires_on = initiated_at + timedelta(seconds=settings.EXPIRATION_SECONDS)
    token_payload = {'exp': expires_on, 'iat': initiated_at, 'sub': str(user_id)}
    access_token: str = encode_token(token_payload)
    return access_token


def get_current_user(
    db: Session = Depends(get_db),
    auth: HTTPAuthorizationCredentials | None = Security(bearer_security),
) -> User:
    if auth is None:
        raise HTTPException(
            detail='Authentication is required.', # Translated from Portuguese
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    try:
        payload = decode_token(auth.credentials)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            detail='Token has expired.', status_code=status.HTTP_401_UNAUTHORIZED # Translated
        )
    except jwt.PyJWTError:
        raise HTTPException(
            detail='Invalid token.', status_code=status.HTTP_401_UNAUTHORIZED # Translated
        )

    user_id = int(payload.get('sub'))
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            detail='User not found.', status_code=status.HTTP_401_UNAUTHORIZED # Translated
        )

    return user