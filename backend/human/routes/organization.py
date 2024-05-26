from fastapi import APIRouter

from human.business.organization.schema import (
    POrganizationCreate,
    POrganizationCreateResponse,
)
from human.business.organization.crud import create_organization
from human.business.user.schema import PUserCreate, PUserResponse
from human.business.user.crud import create_user
from human.business.auth.auth_manager import AuthManager, TokenInfo
from human.data.models.databasemanager import DatabaseManager
from human.shared.config import Config
from human.shared.types import S3Client


def get_router(
    config: Config,
    database: DatabaseManager,
    auth_manager: AuthManager,
    s3_client: S3Client,
) -> APIRouter:
    router = APIRouter()

    @router.post("/organization", response_model=POrganizationCreateResponse)
    async def create_organization_route(
        organization: POrganizationCreate,
    ) -> POrganizationCreateResponse:
        with database.create_session() as session:
            return create_organization(auth_manager, session, organization)

    @router.post("/user", response_model=PUserResponse)
    async def add_user_to_organization(
        user: PUserCreate,
        token_info: TokenInfo = auth_manager.TokenInfo(),
    ) -> PUserResponse:
        with database.create_session() as session:
            return create_user(auth_manager, session, token_info.organization_id, user)

    return router
