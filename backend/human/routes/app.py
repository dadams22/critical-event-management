import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import create_engine
import boto3

from human.routes.routes import get_all_routes
from human.data.models.databasemanager import DatabaseManager
from human.business.auth.auth_manager import AuthManager
from human.shared.config import Config, load_dotenv, load_secrets_into_env

app = FastAPI()

load_dotenv()
config = Config.from_env()
engine = create_engine(config.database_url)
database = DatabaseManager(engine)
auth_manager = AuthManager(config, database)
boto3_session = boto3.Session()
s3_client = boto3_session.client("s3")

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(get_all_routes(config, database, auth_manager, s3_client))
