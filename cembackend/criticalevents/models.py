from collections.abc import Iterable
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta


class Organization(models.Model):
    """Reprensents an organization. Organizations are the entity that kakuna
    sells to, they have users, sites, etc."""

    name = models.CharField(max_length=100)

    def __str__(self) -> str:
        return self.name


class BaseModel(models.Model):
    """Base model for all models in the application. Provides common fields,
    specifically gives everything an organization scoping"""

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)

    class Meta:
        abstract = True


class User(AbstractUser):
    """Represents our user"""

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)

    REQUIRED_FIELDS = ["email", "organization_id"]


class Person(BaseModel):
    """Represents a person who may be impacted by an incident"""

    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone = models.CharField(max_length=50)

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name}"


class Location(BaseModel):
    """Represents a latitude, longitude location"""

    latitude = models.DecimalField(max_digits=18, decimal_places=15)
    longitude = models.DecimalField(max_digits=18, decimal_places=15)

    def __str__(self):
        return f"Location ({self.latitude}, {self.longitude})"


class IncidentReport(BaseModel):
    """Represents an initial incident report, before information has been gathered"""

    reporter = models.ForeignKey(User, on_delete=models.RESTRICT)
    created_at = models.DateTimeField(auto_now_add=True)
    location = models.ForeignKey(
        Location, on_delete=models.SET_NULL, null=True, blank=True
    )
    resolved_at = models.DateTimeField(null=True)

    def __str__(self) -> str:
        return f'Incident at {self.created_at.strftime("%m/%d/%Y %H:%M:%S")}'


class Alert(BaseModel):
    """Represents an alert sent regarding an incident"""

    incident_report = models.ForeignKey(
        IncidentReport, on_delete=models.RESTRICT, related_name="alerts"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    body = models.TextField(max_length=500)
    sender = models.ForeignKey(User, on_delete=models.RESTRICT)


class MessageReceipt(BaseModel):
    """Receipt for a message sent through twilio"""

    twilio_message_id = models.CharField(max_length=50)
    recipient = models.ForeignKey(Person, on_delete=models.RESTRICT)
    incident = models.ForeignKey(IncidentReport, on_delete=models.RESTRICT)
    body = models.TextField(max_length=500)
    sender_phone = models.CharField(max_length=20)
    recipient_phone = models.CharField(max_length=20)


class PersonStatus(BaseModel):
    """Represents the status of a Person in relation to an IncidentReport"""

    person = models.ForeignKey(Person, on_delete=models.CASCADE)
    incident_report = models.ForeignKey(
        IncidentReport, on_delete=models.RESTRICT, related_name="statuses"
    )
    safe = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)

    verbose_plural_name = "Person statuses"


class ShortToken(BaseModel):
    """A token scoped to a particular person and a particular incident"""

    person = models.ForeignKey(
        Person, on_delete=models.CASCADE, related_name="short_tokens"
    )
    incident_report = models.ForeignKey(
        IncidentReport, on_delete=models.CASCADE, related_name="short_tokens"
    )
    token = models.CharField(max_length=10)


def floor_plan_upload_to(instance, filename):
    """Generate a unique path for a floor plan image upload

    NOTE: I tried to generalize the upload_to functions but django gets whiny
    when the function itself doesn't exist on the module, so you need to make
    a new one for each model that needs it."""

    return f"floor_plans/{str(uuid.uuid4())}/{filename}"


class Site(BaseModel):
    """A site with a floor plan"""

    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    longitude = models.DecimalField(max_digits=18, decimal_places=15)
    latitude = models.DecimalField(max_digits=18, decimal_places=15)
    bounds = models.JSONField()

    # TODO: Remove floor plan stuff from site, move to floors
    floor_plan = models.ImageField(
        upload_to=floor_plan_upload_to, null=True, blank=True
    )
    floor_plan_bounds = models.JSONField(null=True, blank=True)

    def __str__(self) -> str:
        return self.name


class Floor(BaseModel):
    """A floor within a site"""

    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name="floors")
    name = models.CharField(max_length=255)
    sort_order = models.IntegerField()

    floor_plan = models.ImageField(upload_to=floor_plan_upload_to)
    floor_plan_bounds = models.JSONField()

    def __str__(self) -> str:
        return self.site.name + ": " + self.name


class AssetType(BaseModel):
    """A type of asset that can be placed on a floor

    Note that asset types are Organization-scoped, so that different
    organizations can have different types of assets"""

    name = models.CharField(max_length=255)
    icon_identifier = models.CharField(max_length=255, default="fire-extinguisher")


def asset_upload_to(instance, filename):
    """Generate a unique path for an asset image upload

    NOTE: I tried to generalize the upload_to functions but django gets whiny
    when the function itself doesn't exist on the module, so you need to make
    a new one for each model that needs it."""

    return f"assets/{str(uuid.uuid4())}/{filename}"


def default_next_maintenance_date():
    """Return the current date as the default next maintenance date"""
    return timezone.now().date()


class Asset(BaseModel):
    """An asset within a site"""

    floor = models.ForeignKey(Floor, on_delete=models.RESTRICT)
    name = models.CharField(max_length=255)
    asset_type = models.ForeignKey(AssetType, on_delete=models.RESTRICT)
    longitude = models.DecimalField(max_digits=18, decimal_places=15)
    latitude = models.DecimalField(max_digits=18, decimal_places=15)
    photo = models.ImageField(upload_to=asset_upload_to, null=True, blank=True)
    next_maintenance_date = models.DateField(default=default_next_maintenance_date)

    @property
    def maintenance_status(self):
        # Get the current date
        current_date = timezone.now().date()
        # Calculate the difference between the current date and next_maintenance_date
        time_until_maintenance = self.next_maintenance_date - current_date
        if time_until_maintenance < timedelta(days=0):
            return "OUT_OF_COMPLIANCE"
        elif time_until_maintenance <= timedelta(days=30):
            return "NEEDS_MAINTENANCE"
        else:
            return "COMPLIANT"

    def __str__(self) -> str:
        return self.name


class AssetProperty(BaseModel):
    """A property of an asset

    Use a star* style property table here because we want to allow users to
    define their own properties for assets.

    TODO: Add some sort of validation so that we can know that all "fire
    extinguisher" assets have a "expiration" property, for example.
    TODO: Add some sort of type field"""

    asset = models.ForeignKey(Asset, on_delete=models.RESTRICT)
    key = models.CharField(max_length=255)
    value = models.CharField(max_length=255)


def maintenance_log_upload_to(instance, filename):
    """Generate a unique path for a maintenance log image upload

    NOTE: I tried to generalize the upload_to functions but django gets whiny
    when the function itself doesn't exist on the module, so you need to make
    a new one for each model that needs it."""

    return f"maintenance_logs/{str(uuid.uuid4())}/{filename}"


class MaintenanceLog(BaseModel):
    """A log of maintenance performed on an asset"""

    asset = models.ForeignKey(
        Asset, on_delete=models.CASCADE, related_name="maintenance_logs"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(max_length=2000)
    photo = models.ImageField(
        upload_to=maintenance_log_upload_to, null=True, blank=True
    )
    reported_by = models.ForeignKey(User, on_delete=models.RESTRICT)
