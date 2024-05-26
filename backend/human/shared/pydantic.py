from pydantic import BaseModel as PydanticBaseModel, ConfigDict, Field


class BaseModel(PydanticBaseModel):
    model_config = ConfigDict(from_attributes=True)
