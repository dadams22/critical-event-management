from uuid import UUID

from human.shared.pydantic import BaseModel
from human.business.user.schema import PUserCreate, PUserResponse


class POrganization(BaseModel):
    name: str


class POrganizationCreate(POrganization):
    user: PUserCreate


class POrganizationResponse(POrganization):
    id: UUID


class POrganizationCreateResponse(POrganizationResponse):
    user: PUserResponse
