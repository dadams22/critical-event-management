from datetime import datetime, timedelta, timezone
from typing import Annotated, Callable
from uuid import UUID

from jose import jwt, JWTError
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext

from human.shared.config import Config
from human.data.models.databasemanager import DatabaseManager
from human.data.models.base import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


class TokenInfo(BaseModel):
    user_id: str
    organization_id: str

    def minimized(self) -> dict:
        return {"u": self.user_id, "o": self.organization_id}

    def from_minimized(data: dict) -> "TokenInfo":
        return TokenInfo(user_id=data["u"], organization_id=data["o"])


class AuthManager:
    def __init__(self, config: Config, database_manager: DatabaseManager):
        self.config = config
        self.database_manager = database_manager

    def _verify_password(self, plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password):
        return pwd_context.hash(password)

    def _get_user(self, session: Session, email: str) -> User | None:
        return (
            session.execute(select(User).where(User.email == email))
            .scalars()
            .one_or_none()
        )

    def authenticate_user(
        self, session: Session, email: str, password: str
    ) -> User | None:
        user = self._get_user(session, email)
        if not user:
            return None
        if not self._verify_password(password, user.password_hashed):
            return None
        return user

    def create_user_access_token(
        self, user: User, expires_delta: timedelta | None = None
    ):
        to_encode = TokenInfo(
            user_id=str(user.id), organization_id=str(user.organization_id)
        ).minimized()

        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=15)
        to_encode.update({"exp": expire})

        encoded_jwt = jwt.encode(
            to_encode, self.config.password_hash_secret_key, algorithm=ALGORITHM
        )
        return encoded_jwt

    def _validate_token_get_user_id(self, token: str) -> UUID | None:
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(
                token, self.config.password_hash_secret_key, algorithms=[ALGORITHM]
            )
            user_id: str = payload.get("sub")
            if user_id is None:
                raise credentials_exception
            return UUID(user_id)
        except JWTError:
            raise credentials_exception

    async def get_token_info(self, token: Annotated[str, Depends(oauth2_scheme)]):
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(
                token, self.config.password_hash_secret_key, algorithms=[ALGORITHM]
            )
            token_info = TokenInfo.from_minimized(payload)
            if token_info is None:
                raise credentials_exception
            return token_info
        except JWTError:
            raise credentials_exception

    def TokenInfo(self):
        return Depends(self.get_token_info, use_cache=True)
