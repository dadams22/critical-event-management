from uuid import UUID
from typing import List, cast

from pydantic import model_validator, Field, ValidationInfo
from human.shared.pydantic import BaseModel, Field
from human.shared.types import S3Client
from human.data.images.main import (
    S3ClientPydanticValidationContext,
    generate_presigned_url,
    presign_model_validator,
)


class PFloor(BaseModel):
    name: str
    floor_plan_bounds: List
    floor_plan: str = Field(..., description="Base64 encoded image")

    @model_validator(mode="before")
    def presign_floor_plan(cls, data, info: ValidationInfo):
        return presign_model_validator("floor_plan", data, info)


class PFloorResponse(PFloor):
    organization_id: UUID
    site_id: UUID
    building_id: UUID
    id: UUID


class PBuilding(BaseModel):
    name: str
    floors: List[PFloor]


class PBuildingResponse(PBuilding):
    organization_id: UUID
    site_id: UUID
    id: UUID
    floors: List[PFloorResponse]


class PSite(BaseModel):
    name: str
    address: str
    longitude: float
    latitude: float
    bounds: List
    buildings: List[PBuilding] | None = None
    # LEGACY: This is a temporary field to support the old way of storing
    # floor plans for the one site one building case
    floors: List[PFloor] | None = None

    @model_validator(mode="after")
    def legacy_no_buildings(cls, data):
        if data.floors is None:
            data.floors = []
            for building in data.buildings:
                for floor in building.floors:
                    data.floors.append(floor)
        return data


class PSiteResponse(PSite):
    organization_id: UUID
    id: UUID
    buildings: List[PBuildingResponse]
    floors: List[PFloorResponse] | None = None
