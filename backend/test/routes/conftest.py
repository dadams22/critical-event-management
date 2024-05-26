import pytest
from unittest.mock import MagicMock
from fastapi import FastAPI
from fastapi.testclient import TestClient

from human.shared.types import S3Client
from human.routes.routes import get_all_routes
from human.shared.config import Config
from human.data.models.base import User
from human.data.models.databasemanager import DatabaseManager
from human.business.auth.auth_manager import AuthManager


@pytest.fixture
def auth_manager(config: Config, database: DatabaseManager):
    return AuthManager(config, database)


@pytest.fixture
def mocked_presigned_url():
    return "https://example.com"


@pytest.fixture
def s3_client(mocked_presigned_url: str):
    mocked_s3_client = MagicMock()
    mocked_s3_client.generate_presigned_url.return_value = mocked_presigned_url
    return mocked_s3_client


@pytest.fixture
def app(
    config: Config,
    database: DatabaseManager,
    auth_manager: AuthManager,
    s3_client: S3Client,
):
    app = FastAPI()
    app.include_router(get_all_routes(config, database, auth_manager, s3_client))
    return app


@pytest.fixture
def unauthenticated_client(app):
    return TestClient(app)


@pytest.fixture
def client(app, user: User, auth_manager: AuthManager):
    client = TestClient(app)
    access_token = auth_manager.create_user_access_token(user)
    client.headers["Authorization"] = f"Bearer {access_token}"
    return client
