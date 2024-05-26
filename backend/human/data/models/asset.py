from uuid import UUID, uuid4
from datetime import datetime, timedelta, timezone

from sqlalchemy import (
    ForeignKeyConstraint,
    UUID,
    Column,
    String,
    DateTime,
    ForeignKey,
    Float,
)
from sqlalchemy.orm import relationship

from human.data.models.base import Base


class AssetType(Base):
    __tablename__ = "asset_type"

    organization_id = Column(UUID, ForeignKey("organization.id"), primary_key=True)
    id = Column(UUID, primary_key=True, default=uuid4)

    name = Column(String, nullable=False)
    icon_identifier = Column(String, nullable=False)


class Asset(Base):
    __tablename__ = "asset"

    organization_id = Column(UUID, primary_key=True)
    site_id = Column(UUID, primary_key=True)
    building_id = Column(UUID, primary_key=True)
    floor_id = Column(UUID, primary_key=True)
    floor = relationship(
        "Floor",
        primaryjoin="and_(Asset.organization_id==Floor.organization_id, Asset.site_id==Floor.site_id, Asset.building_id==Floor.building_id, Asset.floor_id==Floor.id)",
    )
    id = Column(UUID, primary_key=True, default=uuid4)

    asset_type_id = Column(UUID, nullable=False)
    asset_type = relationship(
        "AssetType",
        primaryjoin="and_(Asset.organization_id==AssetType.organization_id, Asset.asset_type_id==AssetType.id)",
    )

    name = Column(String, nullable=False)

    longitude = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)

    photo_img_path = Column(String, nullable=True)
    next_maintenance_date = Column(DateTime, nullable=False)
    managed_by_id = Column(UUID, nullable=True)

    __table_args__ = (
        ForeignKeyConstraint(
            ["organization_id", "site_id", "building_id", "floor_id"],
            ["floor.organization_id", "floor.site_id", "floor.building_id", "floor.id"],
        ),
        ForeignKeyConstraint(
            ["organization_id", "managed_by_id"],
            ["user.organization_id", "user.id"],
        ),
        ForeignKeyConstraint(
            ["organization_id", "asset_type_id"],
            ["asset_type.organization_id", "asset_type.id"],
        ),
    )

    maintenance_logs = relationship(
        "MaintenanceLog",
        back_populates="asset",
        primaryjoin="and_(Asset.organization_id==MaintenanceLog.organization_id, Asset.site_id==MaintenanceLog.site_id, Asset.building_id==MaintenanceLog.building_id, Asset.floor_id==MaintenanceLog.floor_id, Asset.id==MaintenanceLog.asset_id)",
    )
    managed_by = relationship("User")

    @property
    def maintenance_status(self):
        # Get the current date
        current_date = datetime.now()
        # Calculate the difference between the current date and next_maintenance_date
        time_until_maintenance = self.next_maintenance_date - current_date
        if time_until_maintenance < timedelta(days=0):
            return "OUT_OF_COMPLIANCE"
        elif time_until_maintenance <= timedelta(days=30):
            return "NEEDS_MAINTENANCE"
        else:
            return "COMPLIANT"


class MaintenanceLog(Base):
    __tablename__ = "maintenance_log"

    organization_id = Column(UUID, primary_key=True)
    site_id = Column(UUID, primary_key=True)
    building_id = Column(UUID, primary_key=True)
    floor_id = Column(UUID, primary_key=True)
    asset_id = Column(UUID, primary_key=True)
    id = Column(UUID, primary_key=True, default=uuid4)

    created_at = Column(DateTime, nullable=False, server_default="now()")
    notes = Column(String, nullable=False)
    photo_img_path = Column(String, nullable=True)
    reported_by_id = Column(UUID, nullable=False)

    asset = relationship(
        "Asset",
        back_populates="maintenance_logs",
        primaryjoin="and_(MaintenanceLog.organization_id==Asset.organization_id, MaintenanceLog.site_id==Asset.site_id, MaintenanceLog.building_id==Asset.building_id, MaintenanceLog.floor_id==Asset.floor_id, MaintenanceLog.asset_id==Asset.id)",
    )
    reported_by = relationship("User")

    __table_args__ = (
        ForeignKeyConstraint(
            ["organization_id", "site_id", "building_id", "floor_id", "asset_id"],
            [
                "asset.organization_id",
                "asset.site_id",
                "asset.building_id",
                "asset.floor_id",
                "asset.id",
            ],
        ),
        ForeignKeyConstraint(
            ["organization_id", "reported_by_id"],
            ["user.organization_id", "user.id"],
        ),
    )
