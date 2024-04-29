from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from criticalevents.models import Alert, Organization
from django.contrib.auth import get_user_model

User = get_user_model()


class BaseTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.organization = Organization.objects.create(name="Test Organization")
        self.user = User.objects.create_user(
            username="testuser", password="12345", organization=self.organization
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION="Token " + self.token.key)
