from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Alert, IncidentReport, Location, Person, PersonStatus, Site


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


class SiteSerializer(serializers.ModelSerializer):
    location = LocationSerializer()

    class Meta:
        model = Site
        fields = ['id', 'name', 'address', 'location', 'bounds', 'floor_plan', 'floor_plan_bounds']

    def create(self, validated_data):
        location_data = validated_data.pop('location')
        location = Location.objects.create(**location_data)
        site = Site.objects.create(location=location, **validated_data)
        return site

    def update(self, instance, validated_data):
        location_data = validated_data.pop('location')
        location = instance.location

        instance.name = validated_data.get('name', instance.name)
        instance.address = validated_data.get('address', instance.address)
        instance.bounds = validated_data.get('bounds', instance.bounds)
        instance.floor_plan = validated_data.get('floor_plan', instance.floor_plan)
        instance.floor_plan_bounds = validated_data.get('floor_plan_bounds', instance.floor_plan_bounds)
        instance.save()

        # Update location only if location_data is provided
        if location_data:
            for attr, value in location_data.items():
                setattr(location, attr, value)
            location.save()

        return instance
