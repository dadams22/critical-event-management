from typing import List

from fastapi import APIRouter

from pydantic import BaseModel, Field
from sqlalchemy import select

from human.business.auth.auth_manager import AuthManager
from human.data.models.databasemanager import DatabaseManager
from human.shared.config import Config
from human.data.models.base import User


class PingResponse(BaseModel):
    healthy: str = Field(...)


def get_router(_: Config, database: DatabaseManager, *_args) -> APIRouter:
    router = APIRouter()

    @router.get("/ping")
    async def ping() -> PingResponse:
        with database.create_session() as session:
            session.execute(select(1)).all()
            return PingResponse(healthy="true")

    return router
