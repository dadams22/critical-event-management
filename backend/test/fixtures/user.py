import uuid

import pytest
from sqlalchemy.orm import Session

from human.business.auth.auth_manager import AuthManager
from human.data.models.base import Organization, User


@pytest.fixture
def organization(fixture_session):
    organization = Organization(id=uuid.uuid4(), name="Test Organization")
    fixture_session.add(organization)
    fixture_session.commit()
    return organization


@pytest.fixture
def user_password():
    return "hashedpassword"


@pytest.fixture
def user(
    fixture_session: Session,
    organization: Organization,
    user_password: str,
    auth_manager: AuthManager,
):
    user = User(
        id=uuid.uuid4(),
        organization_id=organization.id,
        email="testuser-" + str(uuid.uuid4())[:8] + "@example.com",
        password_hashed=auth_manager.get_password_hash(user_password),
        first_name="First Name",
        last_name="Last Name",
    )
    fixture_session.add(user)
    fixture_session.commit()
    return user
