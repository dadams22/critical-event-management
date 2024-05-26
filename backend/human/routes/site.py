from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends

from human.shared.types import S3Client
from human.business.auth.auth_manager import AuthManager, TokenInfo
from human.data.models.databasemanager import DatabaseManager
from human.shared.config import Config
from human.business.site.crud import PSite, PSiteResponse, create_site, get_sites


def get_router(
    config: Config,
    database: DatabaseManager,
    auth_manager: AuthManager,
    s3_client: S3Client,
) -> APIRouter:
    router = APIRouter()

    @router.post("/site")
    async def create_site_route(
        site: PSite,
        token_info: TokenInfo = auth_manager.TokenInfo(),
    ) -> PSiteResponse:
        with database.create_session() as session:
            return create_site(
                config, session, s3_client, token_info.organization_id, site
            )

    @router.get("/site", response_model=List[PSiteResponse])
    async def get_sites_route(
        token_info: TokenInfo = auth_manager.TokenInfo(),
    ) -> List[PSiteResponse]:
        with database.create_session() as session:
            return get_sites(config, s3_client, session, token_info.organization_id)

    return router
