from sqlalchemy.orm import Session
from typing import List

from human.data.models.sites import Floor
from human.business.asset.schema import (
    PAssetCreate,
    PAssetResponse,
    PAssetType,
    PAssetTypeResponse,
    PMaintenanceLog,
    PMaintenanceLogResponse,
)
from human.data.models.asset import Asset, AssetType, MaintenanceLog
from human.data.images.main import S3ClientPydanticValidationContext, upload_from_base64
from human.shared.types import Config, S3Client


def create_asset_type(
    session: Session,
    organization_id: str,
    asset_type: PAssetType,
) -> PAssetType:
    asset_type_dict = asset_type.model_dump()
    asset_type_dict["organization_id"] = organization_id
    asset_type_db = AssetType(**asset_type_dict)
    session.add(asset_type_db)
    session.commit()

    return PAssetTypeResponse.model_validate(asset_type_db)


def get_asset_types(session: Session, organization_id: str) -> List[PAssetTypeResponse]:
    asset_types = (
        session.query(AssetType)
        .filter(AssetType.organization_id == organization_id)
        .all()
    )
    return [PAssetTypeResponse.model_validate(asset_type) for asset_type in asset_types]


def create_asset(
    config: Config,
    s3_client: S3Client,
    session: Session,
    organization_id: str,
    asset: PAssetCreate,
) -> PAssetResponse:
    asset_dict = asset.model_dump()
    asset_dict["organization_id"] = organization_id

    if asset.photo:
        asset_dict["photo_img_path"] = upload_from_base64(
            s3_client,
            config.image_bucket_name,
            config.image_asset_prefix,
            asset.photo,
        )
    asset_dict.pop("photo")

    floor = session.query(Floor).filter(Floor.id == asset.floor_id).first()
    asset_dict["site_id"] = floor.site_id
    asset_dict["building_id"] = floor.building_id

    # LEGACY: Remove after clients send floor as floor_id
    asset_dict.pop("floor")
    asset_dict.pop("asset_type")
    asset_dict.pop("managed_by")

    asset_db = Asset(**asset_dict)
    session.add(asset_db)
    session.commit()

    return PAssetResponse.model_validate(
        asset_db,
        context=S3ClientPydanticValidationContext(config=config, s3_client=s3_client),
    )


def get_assets(
    config: Config, s3_client: S3Client, session: Session, organization_id: str
) -> List[PAssetResponse]:
    assets = session.query(Asset).filter(Asset.organization_id == organization_id).all()
    return [
        PAssetResponse.model_validate(
            asset,
            context=S3ClientPydanticValidationContext(
                config=config, s3_client=s3_client
            ),
        )
        for asset in assets
    ]


def create_maintenance_log(
    config: Config,
    s3_client: S3Client,
    session: Session,
    organization_id: str,
    user_id: str,
    maintenance_log: PMaintenanceLog,
) -> PMaintenanceLogResponse:
    maintenance_log_dict = maintenance_log.model_dump()

    asset = session.query(Asset).filter(Asset.id == maintenance_log.asset_id).one()

    maintenance_log_dict["organization_id"] = organization_id
    maintenance_log_dict["site_id"] = asset.site_id
    maintenance_log_dict["building_id"] = asset.building_id
    maintenance_log_dict["floor_id"] = asset.floor_id
    maintenance_log_dict["asset_id"] = asset.id
    maintenance_log_dict["reported_by_id"] = user_id

    if maintenance_log.photo:
        maintenance_log_dict["photo_img_path"] = upload_from_base64(
            s3_client,
            config.image_bucket_name,
            config.image_maintenance_log_prefix,
            maintenance_log.photo,
        )
    maintenance_log_dict.pop("photo")

    if maintenance_log.next_maintenance_date:
        asset.next_maintenance_date = maintenance_log.next_maintenance_date
    maintenance_log_dict.pop("next_maintenance_date")

    maintenance_log_db = MaintenanceLog(**maintenance_log_dict)
    asset.maintenance_logs.append(maintenance_log_db)
    session.commit()

    return PMaintenanceLogResponse.model_validate(maintenance_log_db)
