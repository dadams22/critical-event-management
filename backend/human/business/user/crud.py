from uuid import UUID
from typing import List

from human.business.user.schema import PUserCreate, PUserResponse
from human.data.models.base import User
from human.shared.types import Session, AuthManager


def create_user(
    auth_manager: AuthManager,
    session: Session,
    organization_id: UUID,
    user: PUserCreate,
) -> PUserResponse:
    user_dict = user.model_dump()
    user_dict["organization_id"] = organization_id
    user_dict["password_hashed"] = auth_manager.get_password_hash(user.password)
    del user_dict["password"]
    user_db = User(**user_dict)
    session.add(user_db)
    session.commit()
    return PUserResponse.model_validate(user_db)


def get_users(session: Session, organization_id: str) -> List[PUserResponse]:
    users = session.query(User).filter(User.organization_id == organization_id).all()
    return [PUserResponse.model_validate(user) for user in users]
