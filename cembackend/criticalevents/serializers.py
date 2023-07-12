from rest_framework import serializers
from django.contrib.auth.models import User
from .models import IncidentReport, Location

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ('latitude', 'longitude',)

class MinimalUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name',)

class IncidentReportSerializer(serializers.ModelSerializer):
    reporter = MinimalUserSerializer(read_only=True)
    location = LocationSerializer(read_only=True)

    class Meta:
        model = IncidentReport
        fields = ('id', 'reporter', 'location', 'created_at',)
