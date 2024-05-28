import json
import os
from typing import Annotated

from fastapi import Depends
from pydantic import BaseModel
from boto3.session import Session as Boto3Session
from botocore.exceptions import ClientError
from dotenv import load_dotenv as _load_dotenv


def load_dotenv():
    if not _load_dotenv():
        print("No .env file found")
    print(os.environ)


def load_secrets_into_env(session: Boto3Session):
    client = session.client(
        service_name="secretsmanager",
        region_name=os.environ.get("AWS_REGION", "us-west-1"),
    )

    try:
        get_secret_value_response = client.get_secret_value(SecretId="prod/cembackend")
    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceNotFoundException":
            print("The requested secret pyrite-cembackend was not found")
        elif e.response["Error"]["Code"] == "InvalidRequestException":
            print("The request was invalid due to:", e)
        elif e.response["Error"]["Code"] == "InvalidParameterException":
            print("The request had invalid params:", e)
    else:
        if "SecretString" in get_secret_value_response:
            secrets = json.loads(get_secret_value_response["SecretString"])
            for key, value in secrets.items():
                os.environ[key] = value
        else:
            print("No secrets found in prod/cembackend")


class Config(BaseModel):
    database_url: str

    password_hash_secret_key: str

    # s3 image storage configuration
    image_region: str = "us-west-1"
    image_bucket_name: str = "cembackend-uploads"
    image_floor_plan_prefix: str = "floor-plans/"
    image_asset_prefix: str = "assets/"
    image_maintenance_log_prefix: str = "maintenance-logs/"

    @classmethod
    def from_env(cls) -> "Config":
        return cls(
            database_url=os.environ.get(
                "DATABASE_URL", "postgresql://human:dev@127.0.0.1/human"
            ),
            password_hash_secret_key=os.environ.get("PASSWORD_HASH_SECRET_KEY", ""),
        )


def get_config() -> Config:
    return Config.from_env()


ConfigDepends = Annotated[Config, Depends(get_config, use_cache=True)]
