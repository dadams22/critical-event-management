from uuid import UUID

from fastapi import HTTPException, status, APIRouter
from pydantic import BaseModel
from sqlalchemy import select

from human.business.user.crud import create_user, get_users
from human.data.models.base import User
from human.data.models.databasemanager import DatabaseManager
from human.shared.config import Config
from human.business.auth.auth_manager import AuthManager, TokenInfo
from human.business.user.schema import PUser, PUserCreate, PUserResponse


class Login(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


def get_router(_: Config, database: DatabaseManager, auth_manager: AuthManager):
    router = APIRouter()

    @router.post("/token")
    @router.post("/auth")
    async def login_for_access_token(
        form_data: Login,
    ) -> Token:
        with database.create_session() as session:
            user = auth_manager.authenticate_user(
                session, form_data.username, form_data.password
            )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token = auth_manager.create_user_access_token(user)
        return Token(access_token=access_token, token_type="bearer")

    @router.get("/user")
    async def get_users_route(
        token_info: TokenInfo = auth_manager.TokenInfo(),
    ) -> list[PUserResponse]:
        with database.create_session() as session:
            return get_users(session, token_info.organization_id)

    @router.get("/me")
    @router.get("/check_auth")
    async def get_me(token_info: TokenInfo = auth_manager.TokenInfo()) -> PUser:
        with database.create_session() as session:
            user = (
                session.execute(select(User).where(User.id == token_info.user_id))
                .scalars()
                .one()
            )
            return PUser.model_validate(user)

    return router
