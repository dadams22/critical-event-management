import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from human.data.models.base import Organization, User
from human.data.models.sites import Floor
from human.data.models.asset import Asset, AssetType, MaintenanceLog
from human.data.models.databasemanager import DatabaseManager
from shared.image import generate_upload_image_base64


def test_create_asset_success(
    client: TestClient,
    database: DatabaseManager,
    organization: Organization,
    floor: Floor,
    asset_type: AssetType,
):
    asset_data = {
        "floor_id": str(floor.id),
        "name": "Test Asset",
        "asset_type_id": str(asset_type.id),
        "longitude": 10.0,
        "latitude": 20.0,
        "photo": generate_upload_image_base64(),
        "next_maintenance_date": "2024-05-22T11:57:20.819063",
    }
    response = client.post("/asset", json=asset_data)
    assert response.status_code == 200, response.text
    response_data = response.json()
    assert response_data["name"] == "Test Asset"
    assert response_data["asset_type_id"] is not None
    with database.create_session() as session:
        assert (
            session.query(Asset).filter(Asset.name == "Test Asset").first() is not None
        )


def test_create_asset_success_no_image(
    client: TestClient,
    database: DatabaseManager,
    organization: Organization,
    floor: Floor,
    asset_type: AssetType,
):
    asset_data = {
        "floor_id": str(floor.id),
        "name": "Test Asset",
        "asset_type_id": str(asset_type.id),
        "longitude": 10.0,
        "latitude": 20.0,
        "photo": None,
        "next_maintenance_date": "2024-05-22T11:57:20.819063",
    }
    response = client.post("/asset", json=asset_data)
    assert response.status_code == 200, response.text
    response_data = response.json()
    assert response_data["name"] == "Test Asset"
    assert response_data["asset_type_id"] is not None
    with database.create_session() as session:
        assert (
            session.query(Asset).filter(Asset.name == "Test Asset").first() is not None
        )


def test_create_asset_success_legacy_no_id_suffix(
    client: TestClient,
    database: DatabaseManager,
    organization: Organization,
    user: User,
    floor: Floor,
    asset_type: AssetType,
):
    """Test that we can create using floor instead of floor_id (and asset_type
    instead of asset_type_id). This supports the old interfacee that we had
    with the django backend

    LEGACY - Remove once we update the frontend to use the new interface"""

    asset_data = {
        "floor": str(floor.id),
        "name": "Test Asset",
        "asset_type": str(asset_type.id),
        "managed_by": str(user.id),
        "longitude": 10.0,
        "latitude": 20.0,
        "photo": None,
        "next_maintenance_date": "2024-05-22T11:57:20.819063",
    }
    response = client.post("/asset", json=asset_data)
    assert response.status_code == 200, response.text
    response_data = response.json()
    assert response_data["name"] == "Test Asset"
    assert response_data["asset_type_id"] is not None
    assert response_data["managed_by_id"] == str(user.id)
    with database.create_session() as session:
        assert (
            session.query(Asset).filter(Asset.name == "Test Asset").first() is not None
        )


def test_create_asset_failure(client: TestClient):
    asset_data = {}  # Empty data should fail
    response = client.post("/asset", json=asset_data)
    assert response.status_code == 422  # Unprocessable Entity


def test_get_assets_success(
    client: TestClient,
    database: DatabaseManager,
    organization: Organization,
    asset_type: AssetType,
    floor: Floor,
):
    # Prepopulate the database with assets
    with database.create_session() as session:
        for i in range(5):
            asset = Asset(
                organization_id=organization.id,
                site_id=floor.site_id,
                building_id=floor.building_id,
                floor_id=floor.id,
                asset_type_id=asset_type.id,
                name=f"Asset {i}",
                longitude=10.0 + i,
                latitude=20.0 + i,
                next_maintenance_date="2024-05-22T11:57:20.819063",
            )
            session.add(asset)
        session.commit()

    response = client.get("/asset")
    assert response.status_code == 200, response.text
    assets = response.json()
    assert len(assets) == 5
    for i, asset in enumerate(assets):
        assert asset["name"] == f"Asset {i}"
        assert asset["longitude"] == 10.0 + i
        assert asset["latitude"] == 20.0 + i
        assert asset["maintenance_logs"] == []


def test_get_asset_success(
    client: TestClient,
    asset: Asset,
    maintenance_log: MaintenanceLog,
):
    response = client.get("/asset")
    assert response.status_code == 200, response.text
    assets = response.json()
    assert len(assets) == 1
    assert len(assets[0]["maintenance_logs"]) == 1
    assert assets[0]["maintenance_logs"][0]["notes"] == maintenance_log.notes


def test_create_maintenance_log_success(
    client: TestClient,
    database: DatabaseManager,
    organization: Organization,
    asset: Asset,
):
    maintenance_log_data = {
        "organization_id": str(organization.id),
        "asset_id": str(asset.id),
        "notes": "Test Maintenance Log",
        "photo": generate_upload_image_base64(),
    }
    response = client.post("/maintenance_log", json=maintenance_log_data)
    assert response.status_code == 200, response.text
    response_data = response.json()
    assert response_data["notes"] == "Test Maintenance Log"
    with database.create_session() as session:
        assert (
            session.query(MaintenanceLog)
            .filter(MaintenanceLog.notes == "Test Maintenance Log")
            .first()
            is not None
        )
