import uuid

from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import (
    UUID,
    Column,
    ForeignKeyConstraint,
    String,
)


class Base(DeclarativeBase):
    pass


class Organization(Base):
    __tablename__ = "organization"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)


class User(Base):
    __tablename__ = "user"

    organization_id = Column(UUID, primary_key=True)
    id = Column(UUID, primary_key=True, default=uuid.uuid4)

    email = Column(String, unique=True, nullable=False)
    password_hashed = Column(String, nullable=False)

    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)

    __table_args__ = (
        ForeignKeyConstraint(
            ["organization_id"], ["organization.id"], ondelete="CASCADE"
        ),
    )
