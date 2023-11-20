from collections.abc import Iterable
from django.db import models
from django.contrib.auth.models import User


class Person(models.Model):
    """ Represents a person who may be impacted by an incident """
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone = models.CharField(max_length=50)

    def __str__(self) -> str:
        return f'{self.first_name} {self.last_name}'


class Location(models.Model):
    """ Represents a latitude, longitude location """
    latitude = models.DecimalField(max_digits=18, decimal_places=15)
    longitude = models.DecimalField(max_digits=18, decimal_places=15)

    def __str__(self):
        return f'Location ({self.latitude}, {self.longitude})'


class IncidentReport(models.Model):
    """ Represents an initial incident report, before information has been gathered """
    reporter = models.ForeignKey(User, on_delete=models.RESTRICT)
    created_at = models.DateTimeField(auto_now_add=True)
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True)
    resolved_at = models.DateTimeField(null=True)

    def __str__(self) -> str:
        return f'Incident at {self.created_at.strftime("%m/%d/%Y %H:%M:%S")}'


class Alert(models.Model):
    """ Represents an alert sent regarding an incident """
    incident_report = models.ForeignKey(IncidentReport, on_delete=models.RESTRICT, related_name='alerts')
    created_at = models.DateTimeField(auto_now_add=True)
    body = models.TextField(max_length=500)
    sender = models.ForeignKey(User, on_delete=models.RESTRICT)


class MessageReceipt(models.Model):
    """ Receipt for a message sent through twilio """
    twilio_message_id = models.CharField(max_length=50)
    recipient = models.ForeignKey(Person, on_delete=models.RESTRICT)
    incident = models.ForeignKey(IncidentReport, on_delete=models.RESTRICT)
    body = models.TextField(max_length=500)
    sender_phone = models.CharField(max_length=20)
    recipient_phone = models.CharField(max_length=20)


class PersonStatus(models.Model):
    """ Represents the status of a Person in relation to an IncidentReport """
    person = models.ForeignKey(Person, on_delete=models.CASCADE)
    incident_report = models.ForeignKey(IncidentReport, on_delete=models.RESTRICT, related_name='statuses')
    safe = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)

    verbose_plural_name = 'Person statuses'


class ShortToken(models.Model):
    """ A token scoped to a particular person and a particular incident """
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='short_tokens')
    incident_report = models.ForeignKey(IncidentReport, on_delete=models.CASCADE, related_name="short_tokens")
    token = models.CharField(max_length=10)
