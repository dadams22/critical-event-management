from fastapi import APIRouter, Depends
from typing import List

from human.business.asset.crud import (
    create_asset,
    get_assets,
    create_asset_type,
    get_asset_types,
    create_maintenance_log,
)
from human.business.asset.schema import (
    PAssetCreate,
    PAssetResponse,
    PAssetType,
    PAssetTypeResponse,
    PMaintenanceLogCreate,
    PMaintenanceLogResponse,
)
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

    @router.post("/asset", response_model=PAssetResponse)
    async def create_asset_route(
        asset: PAssetCreate,
        token_info: TokenInfo = auth_manager.TokenInfo(),
    ) -> PAssetResponse:
        with database.create_session() as session:
            return create_asset(
                config, s3_client, session, token_info.organization_id, asset
            )

    @router.get("/asset", response_model=List[PAssetResponse])
    async def get_assets_route(
        token_info: TokenInfo = auth_manager.TokenInfo(),
    ) -> List[PAssetResponse]:
        with database.create_session() as session:
            return get_assets(config, s3_client, session, token_info.organization_id)

    @router.post("/asset_type", response_model=PAssetTypeResponse)
    async def create_asset_type_route(
        asset_type: PAssetType,
        token_info: TokenInfo = auth_manager.TokenInfo(),
    ) -> PAssetTypeResponse:
        with database.create_session() as session:
            return create_asset_type(session, token_info.organization_id, asset_type)

    @router.get("/asset_type", response_model=List[PAssetTypeResponse])
    async def get_asset_types_route(
        token_info: TokenInfo = auth_manager.TokenInfo(),
    ) -> List[PAssetTypeResponse]:
        with database.create_session() as session:
            return get_asset_types(session, token_info.organization_id)

    @router.post("/maintenance_log", response_model=PMaintenanceLogResponse)
    async def create_maintenance_log_route(
        maintenance_log: PMaintenanceLogCreate,
        token_info: TokenInfo = auth_manager.TokenInfo(),
    ) -> PMaintenanceLogResponse:
        with database.create_session() as session:
            return create_maintenance_log(
                config,
                s3_client,
                session,
                token_info.organization_id,
                token_info.user_id,
                maintenance_log,
            )

    return router
