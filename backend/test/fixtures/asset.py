import pytest
from sqlalchemy.orm import Session

from human.data.models.base import Organization, User
from human.data.models.sites import Site, Building, Floor
from human.data.models.asset import Asset, AssetType, MaintenanceLog


@pytest.fixture
def asset_type(fixture_session: Session, organization: Organization):
    asset_type = AssetType(
        organization_id=organization.id,
        name="Test Asset Type",
        icon_identifier="test_icon",
    )
    fixture_session.add(asset_type)
    fixture_session.commit()
    return asset_type


@pytest.fixture
def asset(
    fixture_session: Session,
    organization: Organization,
    site: Site,
    building: Building,
    floor: Floor,
    asset_type: AssetType,
):
    asset = Asset(
        organization_id=organization.id,
        site_id=site.id,
        building_id=building.id,
        floor_id=floor.id,
        name="Test Asset",
        asset_type_id=asset_type.id,
        longitude=10.0,
        latitude=20.0,
        next_maintenance_date="2024-05-22T11:57:20.819063",
    )
    fixture_session.add(asset)
    fixture_session.commit()
    return asset


@pytest.fixture
def maintenance_log(
    fixture_session: Session,
    organization: Organization,
    user: User,
    site: Site,
    building: Building,
    floor: Floor,
    asset: Asset,
):
    maintenance_log = MaintenanceLog(
        organization_id=organization.id,
        asset_id=asset.id,
        site_id=site.id,
        building_id=building.id,
        floor_id=floor.id,
        notes="Test Maintenance Log Notes",
        photo_img_path="test_photo.jpg",
        reported_by_id=user.id,
    )
    fixture_session.add(maintenance_log)
    fixture_session.commit()
    return maintenance_log
