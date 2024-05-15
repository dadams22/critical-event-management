# #!/bin/bash

set -ex

# get first 10 chars of the git commit hash
GIT_COMMIT_HASH=$(git rev-parse --short HEAD)
IMAGE_BASE=381491906879.dkr.ecr.us-west-1.amazonaws.com/compliance-emails
IMAGE_TAG=$IMAGE_BASE:$GIT_COMMIT_HASH
IMAGE_TAG_LATEST=$IMAGE_BASE:latest

docker build  . --platform=linux/amd64 -t $IMAGE_TAG
docker tag $IMAGE_TAG $IMAGE_TAG_LATEST
aws ecr get-login-password --region us-west-1 | docker login --username AWS --password-stdin $IMAGE_BASE
docker push $IMAGE_TAG
docker push $IMAGE_TAG_LATEST
aws lambda update-function-code --region=us-west-1 --function-name pyrite_emails_cron_py --image-uri $IMAGE_TAG