#!/usr/bin/env python

import os
from setuptools import setup, find_packages

README = """"""

setup(
    name="python-cembackend",
    version="0.0.1",
    description="Kakuna Backend",
    long_description=README,
    long_description_content_type="text/markdown",
    url="https://github.com/kakuna-dev/critical-event-management",
    author="Mike Lyons",
    author_email="mike@kakuna.io",
    packages=find_packages(exclude=["tmp", "examples", "build"]),
    include_package_data=True,
    scripts=[],
    install_requires=[
        "aiohttp==3.8.4",
        "aiohttp-retry==2.8.3",
        "aiosignal==1.3.1",
        "asgiref==3.7.2",
        "async-timeout==4.0.2",
        "attrs==23.1.0",
        "boto3==1.29.4",
        "botocore==1.32.4",
        "certifi==2023.5.7",
        "charset-normalizer==3.1.0",
        "dj-database-url==2.1.0",
        "Django==4.2.2",
        "django-cors-headers==4.1.0",
        "djangorestframework==3.14.0",
        "frozenlist==1.3.3",
        "gunicorn==22.0.0",
        "idna==3.4",
        "jmespath==1.0.1",
        "multidict==6.0.4",
        "packaging==24.0",
        "pillow==10.3.0",
        "psycopg2-binary==2.9.9",
        "PyJWT==2.7.0",
        "python-dateutil==2.8.2",
        "python-decouple==3.8",
        "pytz==2023.3",
        "requests==2.31.0",
        "s3transfer==0.7.0",
        "six==1.16.0",
        "sqlparse==0.4.4",
        "twilio==8.3.0",
        "typing_extensions==4.6.3",
        "urllib3==2.0.3",
        "yarl==1.9.2",
        "GitPython==3.1.43",
        "django-storages==1.14.2",
        "dj_inmemorystorage==2.1.0",
    ],
    extras_require={
        "dev": [
            "pytest==6.2.4",
            "pytest-cov==2.7.1",
            "pytest-mock==3.6.1",
            "black==24.4.1",
        ]
    },
    license="MIT",
)
