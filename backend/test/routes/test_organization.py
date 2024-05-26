import uuid
from fastapi.testclient import TestClient

from human.data.models.base import Organization, User
from human.shared.types import AuthManager, DatabaseManager, Session


def test_create_organization(
    unauthenticated_client: TestClient, database: DatabaseManager
):
    organization = {
        "name": "Test Organization",
        "user": {
            "email": "test1234" + str(uuid.uuid4()) + "@test.com",
            "password": "password",
            "first_name": "Test",
            "last_name": "User",
        },
    }

    response = unauthenticated_client.post("/organization", json=organization)
    assert response.status_code == 200, response.text

    with database.create_session() as session:
        organization_db = (
            session.query(Organization)
            .filter(response.json()["id"] == Organization.id)
            .first()
        )
        assert organization_db is not None
        assert organization_db.name == "Test Organization"

        users = (
            session.query(User).filter(User.organization_id == organization_db.id).all()
        )
        assert len(users) == 1
        assert users[0].email == organization["user"]["email"]


def test_add_user_to_organization(
    client: TestClient, database: DatabaseManager, organization: Organization
):
    user = {
        "email": "test1234" + str(uuid.uuid4()) + "@test.com",
        "password": "password",
        "first_name": "Test",
        "last_name": "User",
    }

    response = client.post("/user", json=user)
    assert response.status_code == 200, response.text

    with database.create_session() as session:
        user_db = session.query(User).filter(response.json()["id"] == User.id).first()
        assert user_db is not None
        assert user_db.email == user["email"]
        assert user_db.organization_id == organization.id
