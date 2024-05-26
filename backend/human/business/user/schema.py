from uuid import UUID

from human.shared.pydantic import BaseModel


class PUser(BaseModel):
    email: str
    first_name: str
    last_name: str


class PUserCreate(PUser):
    password: str


class PUserResponse(PUser):
    organization_id: UUID
    id: UUID
