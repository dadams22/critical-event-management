import base64
from PIL import Image
from io import BytesIO

from django.core.files.uploadedfile import SimpleUploadedFile


def _generate_test_image() -> bytes:
    """Generate a test image"""

    image = Image.new("RGB", (100, 100))
    image_file = BytesIO()
    image.save(image_file, "JPEG")
    image_file.seek(0)
    return image_file.read()


def generate_upload_image() -> SimpleUploadedFile:
    """Generate a test image for upload"""

    return SimpleUploadedFile(
        "floor_plan.jpg", _generate_test_image(), content_type="image/jpeg"
    )


def generate_upload_image_base64() -> str:
    """Generate a test image for upload in base64"""

    return f"data:image/jpeg;base64,{base64.b64encode(_generate_test_image()).decode('utf-8')}"
