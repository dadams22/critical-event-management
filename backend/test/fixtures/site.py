import pytest
from sqlalchemy.orm import Session

from human.data.models.base import Organization
from human.data.models.sites import Site, Building, Floor


@pytest.fixture
def site(fixture_session: Session, organization: Organization):
    site = Site(
        organization_id=organization.id,
        name="Test Site",
        address="123 Test St",
        longitude=0.0,
        latitude=0.0,
        bounds=[[0, 0], [0, 0]],
    )
    fixture_session.add(site)
    fixture_session.commit()
    return site


@pytest.fixture
def building(fixture_session, site):
    building = Building(
        name="Test Building",
    )
    site.buildings.append(building)
    fixture_session.add(building)
    fixture_session.commit()
    return building


@pytest.fixture
def floor(fixture_session, building):
    floor = Floor(
        sort_order=0,
        floor_plan_img_path="test_path",
        floor_plan_bounds=[[0, 0], [0, 0]],
        name="Test Floor",
    )
    building.floors.append(floor)
    fixture_session.add(floor)
    fixture_session.commit()
    return floor
