import dj_database_url
from .base import *
from criticalevents.shared.config import config as criticalevents_config

database_url = os.getenv("DATABASE_URL", criticalevents_config.DATABASE_URL)
if database_url:
    DATABASES = {"default": dj_database_url.parse(database_url)}
else:
    print("WARNING: DATABASE_URL environment variable not set")

DEBUG = True

# Storage stuff

DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"

AWS_ACCESS_KEY_ID = config(
    "AWS_ACCESS_KEY_ID", default=criticalevents_config.AWS_ACCESS_KEY_ID
)
AWS_SECRET_ACCESS_KEY = config(
    "AWS_SECRET_ACCESS_KEY", default=criticalevents_config.AWS_SECRET_ACCESS_KEY
)
AWS_STORAGE_BUCKET_NAME = config(
    "AWS_STORAGE_BUCKET_NAME", default=criticalevents_config.AWS_STORAGE_BUCKET_NAME
)
AWS_S3_REGION_NAME = config(
    "AWS_S3_REGION_NAME", default=criticalevents_config.AWS_S3_REGION_NAME
)
