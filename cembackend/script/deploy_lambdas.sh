# #!/bin/bash

set -ex

# get first 10 chars of the git commit hash
GIT_COMMIT_HASH=$(git rev-parse --short HEAD)
IMAGE_TAG=381491906879.dkr.ecr.us-west-1.amazonaws.com/pyrite_emails_cron_py-lambda:$GIT_COMMIT_HASH
IMAGE_TAG_LATEST=381491906879.dkr.ecr.us-west-1.amazonaws.com/pyrite_emails_cron_py-lambda:latest

docker build  . --platform=linux/amd64 -t $IMAGE_TAG
docker tag $IMAGE_TAG $IMAGE_TAG_LATEST
aws ecr get-login-password --region us-west-1 | docker login --username AWS --password-stdin 381491906879.dkr.ecr.us-west-1.amazonaws.com/pyrite_emails_cron_py-lambda
docker push $IMAGE_TAG
docker push $IMAGE_TAG_LATEST
aws lambda update-function-code --region=us-west-1 --function-name pyrite_emails_cron_py --image-uri $IMAGE_TAG