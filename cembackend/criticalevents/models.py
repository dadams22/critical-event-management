from django.db import models
from django.contrib.auth.models import User


class Person(models.Model):
    """ Represents a person who may be impacted by an incident """
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone = models.CharField(max_length=50)

    def __str__(self) -> str:
        return f'{self.first_name} {self.last_name}'


class IncidentReport(models.Model):
    """ Represents an initial incident report, before information has been gathered """
    reporter = models.ForeignKey(User, on_delete=models.RESTRICT)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f'Incident at {self.created_at.strftime("%m/%d/%Y %H:%M:%S")}'
