import os

from fastapi.testclient import TestClient

import pytest
from sqlalchemy.engine import Engine, create_engine
from alembic.config import Config as AlembicConfig
from alembic import command

from human.data.models.databasemanager import DatabaseManager
from human.shared.config import Config


@pytest.fixture(scope="session")
def database_url():
    return "postgresql://human:dev@127.0.0.1/human_test"


@pytest.fixture(scope="session")
def config(database_url: str):
    return Config(
        database_url=database_url,
        password_hash_secret_key="deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    )


@pytest.fixture(scope="session")
def engine(config: Config):
    return create_engine(config.database_url)


@pytest.fixture(scope="session")
def migrated_database(engine: Engine, config: Config):
    alembic_cfg = AlembicConfig()
    alembic_cfg.set_main_option(
        "script_location",
        os.path.join(os.path.dirname(__file__), "..", "db"),
    )
    os.environ["DATABASE_URL"] = config.database_url
    alembic_cfg.set_main_option("sqlalchemy.url", config.database_url)
    command.upgrade(alembic_cfg, "head")
    yield engine
    # command.downgrade(alembic_cfg, "base")


@pytest.fixture(scope="session")
def database(migrated_database: Engine):
    return DatabaseManager(migrated_database)


@pytest.fixture
def fixture_session(database: DatabaseManager):
    with database.create_session() as session:
        yield session


pytest_plugins = [
    "fixtures.user",
    "fixtures.site",
    "fixtures.asset",
]
