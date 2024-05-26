from fastapi import APIRouter

from human.shared.types import S3Client
from human.data.models.databasemanager import DatabaseManager
from human.shared.config import Config
from human.business.auth.auth_manager import AuthManager

from human.routes.ping import get_router as get_router_ping
from human.routes.auth import get_router as get_router_auth
from human.routes.site import get_router as get_router_site
from human.routes.asset import get_router as get_router_asset
from human.routes.organization import get_router as get_router_organization


def get_all_routes(
    config: Config,
    database: DatabaseManager,
    auth_manager: AuthManager,
    s3_client: S3Client,
) -> APIRouter:
    router = APIRouter()
    router.include_router(get_router_ping(config, database, auth_manager))
    router.include_router(get_router_auth(config, database, auth_manager))
    router.include_router(get_router_site(config, database, auth_manager, s3_client))
    router.include_router(get_router_asset(config, database, auth_manager, s3_client))
    router.include_router(
        get_router_organization(config, database, auth_manager, s3_client)
    )
    return router
