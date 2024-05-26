from human.shared.types import AuthManager, Session
from human.business.user.crud import create_user
from human.business.user.schema import PUserCreate
from human.business.organization.schema import (
    POrganizationCreate,
    POrganizationResponse,
    POrganizationCreateResponse,
)
from human.data.models.base import Organization


def create_organization(
    auth_manager: AuthManager, session: Session, organization: POrganizationCreate
) -> POrganizationCreateResponse:
    organization_db = Organization(
        name=organization.name,
    )
    session.add(organization_db)
    session.commit()

    user = create_user(auth_manager, session, organization_db.id, organization.user)

    response_dict = POrganizationResponse.model_validate(organization_db).model_dump()
    response_dict["user"] = user.model_dump()

    return POrganizationCreateResponse(**response_dict)
