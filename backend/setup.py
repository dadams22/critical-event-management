#!/usr/bin/env python

import os
from setuptools import setup, find_packages

README = """"""

setup(
    name="python-human",
    version="0.0.1",
    description="Human Backend",
    long_description=README,
    long_description_content_type="text/markdown",
    url="https://github.com/kakuna-dev/critical-event-management",
    author="Mike Lyons",
    author_email="mike@kakuna.io",
    packages=find_packages(exclude=["tmp", "examples", "build"]),
    include_package_data=True,
    scripts=[],
    install_requires=[
        "alembic==1.13.1",
        "annotated-types==0.6.0",
        "anyio==4.3.0",
        "bcrypt==4.1.3",
        "boto3==1.34.108",
        "boto3-stubs==1.34.110",
        "botocore==1.34.108",
        "botocore-stubs==1.34.94",
        "certifi==2024.2.2",
        "cffi==1.16.0",
        "charset-normalizer==3.3.2",
        "click==8.1.7",
        "cryptography==42.0.7",
        "dnspython==2.6.1",
        "ecdsa==0.19.0",
        "email_validator==2.1.1",
        "fastapi==0.111.0",
        "fastapi-cli==0.0.3",
        "h11==0.14.0",
        "httpcore==1.0.5",
        "httptools==0.6.1",
        "httpx==0.27.0",
        "idna==3.7",
        "iniconfig==2.0.0",
        "Jinja2==3.1.4",
        "jmespath==1.0.1",
        "Mako==1.3.5",
        "markdown-it-py==3.0.0",
        "MarkupSafe==2.1.5",
        "mdurl==0.1.2",
        "moto==5.0.7",
        "mypy-boto3-s3==1.34.105",
        "orjson==3.10.3",
        "packaging==24.0",
        "passlib==1.7.4",
        "pillow==10.3.0",
        "pluggy==1.5.0",
        "psycopg2-binary==2.9.9",
        "py-partiql-parser==0.5.5",
        "pyasn1==0.6.0",
        "pycparser==2.22",
        "pydantic==2.7.1",
        "pydantic_core==2.18.2",
        "Pygments==2.18.0",
        "python-dateutil==2.9.0.post0",
        "python-dotenv==1.0.1",
        "python-jose==3.3.0",
        "python-multipart==0.0.9",
        "PyYAML==6.0.1",
        "requests==2.32.2",
        "responses==0.25.0",
        "rich==13.7.1",
        "rsa==4.9",
        "s3transfer==0.10.1",
        "shellingham==1.5.4",
        "six==1.16.0",
        "sniffio==1.3.1",
        "SQLAlchemy==2.0.30",
        "starlette==0.37.2",
        "typer==0.12.3",
        "types-awscrt==0.20.9",
        "types-s3transfer==0.10.1",
        "typing_extensions==4.11.0",
        "ujson==5.10.0",
        "urllib3==2.2.1",
        "uvicorn==0.29.0",
        "uvloop==0.19.0",
        "watchfiles==0.21.0",
        "websockets==12.0",
        "Werkzeug==3.0.3",
        "xmltodict==0.13.0",
    ],
    extras_require={
        "dev": [
            "pytest==8.2.1",
            "pytest-cov==2.7.1",
            "black==24.4.1",
        ]
    },
    license="MIT",
)
