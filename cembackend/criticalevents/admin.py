from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import (
    User,
    Organization,
    Alert,
    Person,
    IncidentReport,
    PersonStatus,
    ShortToken,
    Site,
    Floor,
    Asset,
    AssetType,
)

# Register your models here.
admin.site.register(User, UserAdmin)
admin.site.register(Organization)
admin.site.register(Person)
admin.site.register(IncidentReport)
admin.site.register(Alert)
admin.site.register(PersonStatus)
admin.site.register(ShortToken)
admin.site.register(Site)
admin.site.register(Floor)
admin.site.register(Asset)
admin.site.register(AssetType)
