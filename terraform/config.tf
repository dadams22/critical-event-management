provider "aws" {
    region = "us-west-1"
}

# Stores Terraform state in an S3 bucket to share with other developers
resource "aws_s3_bucket" "state" {
  bucket = "pyrite-terraform"

  server_side_encryption_configuration {
    rule {
      bucket_key_enabled = false

      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

# Stores a lock in a DynamoDB table to prevent concurrent runs
resource "aws_dynamodb_table" "terraform_statelock" {
  name           = "pyrite-terraform"
  read_capacity  = 2
  write_capacity = 2
  hash_key       = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}

terraform {
  backend "s3" {
    bucket         = "pyrite-terraform"
    key            = "terraform"
    region         = "us-west-1"
    dynamodb_table = "pyrite-terraform"
  }
}