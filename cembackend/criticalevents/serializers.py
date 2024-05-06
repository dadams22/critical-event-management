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
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
        )


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
    site = serializers.PrimaryKeyRelatedField(
        queryset=Site.objects.all(), required=False
    )

    class Meta:
        model = Floor
        fields = ("id", "name", "site", "sort_order", "floor_plan", "floor_plan_bounds")


class SiteSerializer(serializers.ModelSerializer):
    floors = FloorSerializer(many=True, required=False)

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
            "floors",
        )

    def create(self, validated_data):
        floors_data = None
        if "floors" in validated_data:
            floors_data = validated_data.pop("floors")

        site = Site.objects.create(**validated_data)

        if floors_data:
            for floor_data in floors_data:
                Floor.objects.create(
                    site=site, organization=self.context["organization"], **floor_data
                )

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


class AssetSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # HACK: Depth=1 breaks the .create method for any model with a foreign
        # key. I got this fix here: https://stackoverflow.com/questions/66858087/django-rest-framework-adding-depth-in-serializer-gives-foreign-key-constraint
        request = self.context.get("request")
        if request and request.method == "GET":
            self.Meta.depth = 2
            self.Meta.fields += ("maintenance_logs",)
        else:
            self.Meta.depth = 0
            self.Meta.fields = [
                field for field in self.Meta.fields if field != "maintenance_logs"
            ]

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
        )
        read_only_fields = ("maintenance_status",)
