from sqlalchemy.orm import Session
from typing import List

from human.business.site.schema import (
    PBuildingCreate,
    PBuildingResponse,
    PFloor,
    PBuilding,
    PSite,
    PSiteResponse,
)
from human.data.models.sites import Site, Building, Floor
from human.data.images.main import upload_from_base64, S3ClientPydanticValidationContext
from human.shared.types import S3Client, Config


def _create_floor(
    config: Config,
    s3_client: S3Client,
    organization_id: str,
    site: Site,
    sort_order: int,
    building: Building,
    floor: PFloor,
):
    floor_dict = floor.model_dump()
    floor_dict["organization_id"] = organization_id
    floor_dict["site_id"] = site.id
    floor_dict["building_id"] = building.id
    floor_dict["sort_order"] = sort_order
    floor_dict["floor_plan_img_path"] = upload_from_base64(
        s3_client,
        config.image_bucket_name,
        config.image_floor_plan_prefix,
        floor.floor_plan,
    )
    del floor_dict["floor_plan"]
    floor_db = Floor(**floor_dict)
    building.floors.append(floor_db)


def _create_building_for_site(
    config: Config,
    session: Session,
    s3_client: S3Client,
    organization_id: str,
    site: Site,
    building: PBuilding,
) -> PBuildingResponse:
    building_dict = building.model_dump()
    building_dict["organization_id"] = organization_id
    building_dict["site_id"] = site.id
    building_dict.pop("floors")
    building_db = Building(**building_dict)
    for sort_order, floor in enumerate(building.floors):
        _create_floor(
            config, s3_client, organization_id, site, sort_order, building_db, floor
        )
    site.buildings.append(building_db)
    session.commit()
    return PBuildingResponse.model_validate(
        building_db,
        context=S3ClientPydanticValidationContext(config=config, s3_client=s3_client),
    )


def create_building(
    config: Config,
    session: Session,
    s3_client: S3Client,
    organization_id: str,
    building: PBuildingCreate,
) -> PBuildingResponse:
    site = session.get(Site, (organization_id, building.site_id))
    return _create_building_for_site(
        config, session, s3_client, organization_id, site, building
    )


def create_site(
    config: Config,
    session: Session,
    s3_client: S3Client,
    organization_id: str,
    site: PSite,
) -> PSiteResponse:
    site_dict = site.model_dump()
    site_dict["organization_id"] = organization_id
    site_dict.pop("buildings")
    site_dict.pop("floors")
    site_db = Site(**site_dict)
    session.add(site_db)

    # LEGACY: This is a temporary field to support the old way of storing
    if site.buildings is None:
        site.buildings = [PBuilding(name="Default Building", floors=site.floors)]

    for building in site.buildings:
        _create_building_for_site(
            config, session, s3_client, organization_id, site_db, building
        )

    session.commit()
    site_db = session.get(Site, (site_db.organization_id, site_db.id))
    return PSiteResponse.model_validate(
        site_db,
        context=S3ClientPydanticValidationContext(config=config, s3_client=s3_client),
    )


def get_sites(
    config: Config, s3_client: S3Client, session: Session, organization_id: str
) -> List[PSiteResponse]:
    sites = session.query(Site).filter(Site.organization_id == organization_id).all()
    return [
        PSiteResponse.model_validate(
            site,
            context=S3ClientPydanticValidationContext(
                config=config, s3_client=s3_client
            ),
        )
        for site in sites
    ]
