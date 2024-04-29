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
