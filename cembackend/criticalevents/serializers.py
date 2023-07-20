from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Alert, IncidentReport, Location, Person, PersonStatus


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ('latitude', 'longitude',)


class MinimalUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name',)


class DetailedAlertSerializer(serializers.ModelSerializer):
    sender = MinimalUserSerializer()

    class Meta:
        model = Alert
        fields = ('id', 'incident_report', 'sender', 'created_at', 'body')


class AlertSerializer(serializers.ModelSerializer):
    sender = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Alert
        fields = ('id', 'incident_report', 'sender', 'created_at', 'body')


class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = ('id', 'first_name', 'last_name', 'phone',)


class PersonStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonStatus
        fields = ('id', 'safe', 'person')


class IncidentReportSerializer(serializers.ModelSerializer):
    reporter = MinimalUserSerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    alerts = DetailedAlertSerializer(many=True, read_only=True)
    statuses = PersonStatusSerializer(many=True, read_only=True)

    class Meta:
        model = IncidentReport
        fields = ('id', 'reporter', 'location', 'alerts', 'statuses', 'created_at', 'resolved_at',)
