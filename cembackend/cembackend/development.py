from .base import *

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

DEBUG = True

# Storage stuff

DEFAULT_FILE_STORAGE = "inmemorystorage.InMemoryStorage"
