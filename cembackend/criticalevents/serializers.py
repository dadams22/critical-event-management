from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()
from .models import (
    Alert,
    IncidentReport,
    Location,
    Person,
    PersonStatus,
    Site,
    Building,
    Floor,
    Asset,
    AssetType,
    MaintenanceLog,
)


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = (
            "latitude",
            "longitude",
        )


class MinimalUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "email")


class DetailedAlertSerializer(serializers.ModelSerializer):
    sender = MinimalUserSerializer()

    class Meta:
        model = Alert
        fields = ("id", "incident_report", "sender", "created_at", "body")


class AlertSerializer(serializers.ModelSerializer):
    sender = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Alert
        fields = ("id", "incident_report", "sender", "created_at", "body")


class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = (
            "id",
            "first_name",
            "last_name",
            "phone",
        )


class PersonStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonStatus
        fields = ("id", "safe", "person")


class IncidentReportSerializer(serializers.ModelSerializer):
    reporter = MinimalUserSerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    alerts = DetailedAlertSerializer(many=True, read_only=True)
    statuses = PersonStatusSerializer(many=True, read_only=True)

    class Meta:
        model = IncidentReport
        fields = (
            "id",
            "reporter",
            "location",
            "alerts",
            "statuses",
            "created_at",
            "resolved_at",
        )


class FloorSerializer(serializers.ModelSerializer):
    building = serializers.PrimaryKeyRelatedField(
        queryset=Building.objects.all(), required=False
    )

    class Meta:
        model = Floor
        fields = (
            "id",
            "name",
            "building",
            "sort_order",
            "floor_plan",
            "floor_plan_bounds",
        )


class BuildingSerializer(serializers.ModelSerializer):
    floors = FloorSerializer(many=True, required=False)
    site = serializers.PrimaryKeyRelatedField(
        queryset=Site.objects.all(), required=False
    )

    class Meta:
        model = Building
        fields = ("id", "name", "floors", "site")

    def create(self, validated_data):
        floors_data = None
        if "floors" in validated_data:
            floors_data = validated_data.pop("floors")

        validated_data["organization"] = self.context["organization"]
        building = Building.objects.create(**validated_data)

        if floors_data:
            for floor_data in floors_data:
                Floor.objects.create(
                    building=building,
                    organization=self.context["organization"],
                    **floor_data
                )

        return building


class SiteSerializer(serializers.ModelSerializer):
    buildings = BuildingSerializer(many=True, required=False)

    class Meta:
        model = Site
        fields = (
            "id",
            "name",
            "address",
            "longitude",
            "latitude",
            "bounds",
            "floor_plan",
            "floor_plan_bounds",
            "buildings",
        )

    def create(self, validated_data):
        buildings_data = None
        if "buildings" in validated_data:
            buildings_data = validated_data.pop("buildings")

        site = Site.objects.create(**validated_data)

        if buildings_data:
            for building_data in buildings_data:
                building_data["site"] = site
                BuildingSerializer(context=self.context).create(building_data)

        return site


class AssetTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetType
        fields = ("id", "name", "icon_identifier")


class MaintenanceLogSerializer(serializers.ModelSerializer):
    reported_by = MinimalUserSerializer(read_only=True)
    next_maintenance_date = serializers.DateField(write_only=True, required=False)

    class Meta:
        model = MaintenanceLog
        fields = (
            "id",
            "notes",
            "asset",
            "created_at",
            "photo",
            "reported_by",
            "next_maintenance_date",
        )

    def create(self, validated_data):
        next_maintenance_date = validated_data.pop("next_maintenance_date", None)
        maintenance_log = MaintenanceLog.objects.create(**validated_data)

        if next_maintenance_date:
            maintenance_log.asset.next_maintenance_date = next_maintenance_date
            maintenance_log.asset.save()

        return maintenance_log


class AssetCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = (
            "id",
            "name",
            "asset_type",
            "floor",
            "longitude",
            "latitude",
            "photo",
            "next_maintenance_date",
            "managed_by",
        )


class AssetSerializer(serializers.ModelSerializer):
    maintenance_logs = MaintenanceLogSerializer(many=True, read_only=True)
    asset_type = AssetTypeSerializer()
    floor = FloorSerializer()
    managed_by = MinimalUserSerializer(read_only=True)

    class Meta:
        model = Asset
        fields = (
            "id",
            "name",
            "asset_type",
            "floor",
            "longitude",
            "latitude",
            "photo",
            "next_maintenance_date",
            "maintenance_status",
            "maintenance_logs",
            "managed_by",
        )
        read_only_fields = ("maintenance_status",)
