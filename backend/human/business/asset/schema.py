from typing import List, Optional
from uuid import UUID
from datetime import datetime

from pydantic import ValidationInfo, model_validator

from human.business.user.schema import PUserResponse
from human.business.site.schema import PFloorResponse
from human.data.images.main import presign_model_validator
from human.shared.pydantic import BaseModel


class PAsset(BaseModel):
    organization_id: UUID | None = None
    site_id: UUID | None = None
    building_id: UUID | None = None
    floor_id: UUID
    name: str
    asset_type_id: UUID
    longitude: float
    latitude: float
    photo: str | None = None
    next_maintenance_date: datetime
    managed_by_id: UUID | None = None

    @model_validator(mode="before")
    def presign_floor_plan(cls, data, info: ValidationInfo):
        return presign_model_validator("photo", data, info)


class PAssetCreate(PAsset):
    floor: Optional[UUID] = None
    asset_type: Optional[UUID] = None
    managed_by: Optional[UUID] = None

    @model_validator(mode="before")
    def allow_ids_without_id_suffix(cls, data, info: ValidationInfo):
        if "floor" in data:
            data["floor_id"] = data["floor"]
            del data["floor"]
        if "asset_type" in data:
            data["asset_type_id"] = data["asset_type"]
            del data["asset_type"]
        if "managed_by" in data:
            data["managed_by_id"] = data["managed_by"]
            del data["managed_by"]
        return data


class PAssetResponse(PAsset):
    id: UUID
    organization_id: UUID
    site_id: UUID
    building_id: UUID
    floor_id: UUID
    floor: PFloorResponse
    asset_type: "PAssetTypeResponse"
    maintenance_logs: List["PMaintenanceLogResponse"]
    managed_by: PUserResponse | None = None
    maintenance_status: str


class PAssetType(BaseModel):
    name: str
    icon_identifier: str


class PAssetTypeResponse(PAssetType):
    organization_id: UUID
    id: UUID


class PMaintenanceLog(BaseModel):
    asset_id: UUID

    notes: str
    photo: str | None = None
    next_maintenance_date: datetime | None = None

    @model_validator(mode="before")
    def presign_photo(cls, data, info: ValidationInfo):
        return presign_model_validator("photo", data, info)


class PMaintenanceLogResponse(PMaintenanceLog):
    organization_id: UUID
    site_id: UUID
    building_id: UUID
    floor_id: UUID
    asset_id: UUID
    id: UUID
    reported_by_id: UUID
    reported_by: PUserResponse


class PMaintenanceLogCreate(PMaintenanceLog):
    asset: Optional[UUID] = None

    @model_validator(mode="before")
    def allow_ids_without_id_suffix(cls, data):
        if "asset" in data:
            data["asset_id"] = data["asset"]
            del data["asset"]
        return data
