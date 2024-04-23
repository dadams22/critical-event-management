import dj_database_url
from .base import *

database_url = os.getenv('DATABASE_URL')
if database_url:
    DATABASES = {
        'default': dj_database_url.parse(os.getenv('DATABASE_URL'))
    }
else:
    print('WARNING: DATABASE_URL environment variable not set')

DEBUG = True