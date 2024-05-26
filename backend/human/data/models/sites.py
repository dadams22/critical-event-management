from uuid import UUID, uuid4
from typing import List

from pydantic import model_validator, root_validator
from sqlalchemy import (
    ForeignKeyConstraint,
    UUID,
    Column,
    JSON,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Float,
)
from sqlalchemy.orm import relationship

from human.data.models.base import Base, Organization


class Site(Base):
    __tablename__ = "site"

    organization_id = Column(UUID, ForeignKey("organization.id"), primary_key=True)
    id = Column(UUID, primary_key=True, default=uuid4)

    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    longitude = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    bounds = Column(JSON, nullable=False)

    buildings = relationship("Building", back_populates="site")


class Building(Base):
    __tablename__ = "building"

    organization_id = Column(UUID, primary_key=True)
    site_id = Column(UUID, primary_key=True)
    id = Column(UUID, primary_key=True, default=uuid4)
    name = Column(String, nullable=False)

    site = relationship("Site", back_populates="buildings")
    floors = relationship("Floor", back_populates="building")

    __table_args__ = (
        ForeignKeyConstraint(
            ["organization_id", "site_id"], ["site.organization_id", "site.id"]
        ),
    )


class Floor(Base):
    __tablename__ = "floor"

    organization_id = Column(UUID, primary_key=True)
    site_id = Column(UUID, primary_key=True)
    building_id = Column(UUID, primary_key=True)
    id = Column(UUID, primary_key=True, default=uuid4)

    name = Column(String, nullable=False)
    sort_order = Column(Integer, nullable=False)

    floor_plan_img_path = Column(String, nullable=False)
    floor_plan_bounds = Column(JSON, nullable=False)

    building = relationship("Building", back_populates="floors")

    __table_args__ = (
        ForeignKeyConstraint(
            ["organization_id", "site_id", "building_id"],
            ["building.organization_id", "building.site_id", "building.id"],
        ),
    )
