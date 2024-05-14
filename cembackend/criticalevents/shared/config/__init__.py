import json
import os
from typing import Optional

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from dotenv import load_dotenv


try:
    load_dotenv()
except Exception as e:
    print(f"Error loading .env file: {e}. Will attempt to use defaults")


def load_secrets_into_env():
    session = boto3.session.Session()
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


load_secrets_into_env()


class Config:
    DATABASE_URL = os.environ.get("DATABASE_URL", "")
    IMAGE_BUCKET_NAME = "sous-images"

    AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY", "")
    AWS_STORAGE_BUCKET_NAME = os.environ.get("AWS_STORAGE_BUCKET_NAME", "")
    AWS_S3_REGION_NAME = os.environ.get("AWS_S3_REGION_NAME", "us-west-1")

    RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "test")


config = Config
