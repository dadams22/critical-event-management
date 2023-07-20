from django.contrib import admin

from .models import Alert, Person, IncidentReport, PersonStatus

# Register your models here.
admin.site.register(Person)
admin.site.register(IncidentReport)
admin.site.register(Alert)
admin.site.register(PersonStatus)