import base64
from typing import Any, cast
import uuid

from pydantic import ValidationInfo

from human.shared.types import S3Client, Config
from human.shared.pydantic import BaseModel


class S3ClientPydanticValidationContext:
    config: Config
    s3_client: S3Client

    def __init__(self, config: Config, s3_client: S3Client):
        self.config = config
        self.s3_client = s3_client


def upload_from_base64(
    s3_client: S3Client, bucket_name: str, prefix: str, data_str: str
) -> str:
    # data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCABkAGQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD5/ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//2Q==
    format, imgstr = data_str.split(";base64,")
    ext = format.split("/")[-1]

    image_key = prefix + uuid.uuid4().hex + "." + ext
    image_data = base64.b64decode(imgstr)

    s3_client.put_object(Bucket=bucket_name, Key=image_key, Body=image_data)

    return image_key


def generate_presigned_url(s3_client: S3Client, bucket_name: str, key: str) -> str:
    return s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket_name, "Key": key},
        ExpiresIn=3600,
    )


def presign_model_validator(key: str, data: Any, info: ValidationInfo) -> Any:
    validation_context = cast(S3ClientPydanticValidationContext, info.context)
    if not validation_context:
        return data

    img_path_key = key + "_img_path"

    if not hasattr(data, img_path_key) or not getattr(data, img_path_key):
        return data

    presigned_url = generate_presigned_url(
        validation_context.s3_client,
        validation_context.config.image_bucket_name,
        getattr(data, img_path_key),
    )
    setattr(data, key, presigned_url)

    return data
