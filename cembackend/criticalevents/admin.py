from django.contrib import admin

from .models import Person, IncidentReport

# Register your models here.
admin.site.register(Person)
admin.site.register(IncidentReport)