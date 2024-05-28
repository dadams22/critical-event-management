from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends

from human.shared.types import S3Client
from human.business.auth.auth_manager import AuthManager, TokenInfo
from human.data.models.databasemanager import DatabaseManager
from human.shared.config import Config
from human.business.site.crud import create_site, get_sites, create_building
from human.business.site.schema import (
    PBuildingCreate,
    PSite,
    PSiteResponse,
    PBuilding,
    PBuildingResponse,
)


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

    @router.post("/building")
    async def create_building_route(
        building: PBuildingCreate,
        token_info: TokenInfo = auth_manager.TokenInfo(),
    ) -> PBuildingResponse:
        with database.create_session() as session:
            return create_building(
                config, session, s3_client, token_info.organization_id, building
            )

    @router.get("/site", response_model=List[PSiteResponse])
    async def get_sites_route(
        token_info: TokenInfo = auth_manager.TokenInfo(),
    ) -> List[PSiteResponse]:
        with database.create_session() as session:
            return get_sites(config, s3_client, session, token_info.organization_id)

    return router
