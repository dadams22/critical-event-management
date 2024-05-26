#!/bin/bash

# This script is the entrypoint for the development container. It will be run
# when the container starts. We try to keep the system as close as possible to
# production system, but a few tweaks are made to make development easier.
# Tweaks:
# - We automatically run the fastapi server in development mode
# - We automatically run the migrations on startup
#
# NOTE: This script is baked into the image, so if you change it you will need
# to rebuild the image with `docker compose up --build`

export DATABASE_URL="postgresql://human:dev@db/human"

alembic upgrade head
# If migration failed exit with error
if [ $? -ne 0 ]; then
    echo "Running migrations failed! See output above, re-run containers with"
    echo "    docker compose up"
    exit 1
fi

fastapi dev human/routes/app.py --host "0.0.0.0"
if [ $? -ne 0 ]; then
    echo "Running FastAPI failed!"
    echo "If you changed dependencies you might need to re-build the containers"
    echo "    with docker compose up --build"
    exit 1
fi
