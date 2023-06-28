from rest_framework import serializers
from django.contrib.auth.models import User
from .models import IncidentReport

class MinimalUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name',)

class IncidentReportSerializer(serializers.ModelSerializer):
    reporter = MinimalUserSerializer()

    class Meta:
        model = IncidentReport
        fields = ('id', 'reporter', 'created_at',)
