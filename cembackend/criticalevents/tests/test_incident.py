from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from criticalevents.models import Organization, IncidentReport

User = get_user_model()


class IncidentTestCases(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.organization = Organization.objects.create(name="Test Organization")
        self.user = User.objects.create_user(
            username="testuser", password="12345", organization=self.organization
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION="Token " + self.token.key)

    def test_create_incident_report(self):
        # Define the new incident report data
        new_incident_report_data = {
            "location": {
                "latitude": 0.0,
                "longitude": 0.0,
            },
        }
        # Make a POST request to the CreateIncidentReportView
        response = self.client.post(
            "/api/report-incident", data=new_incident_report_data, format="json"
        )
        if response.status_code != 200:
            print(response.content)
        # Check that the status code is 200 (OK)
        self.assertEqual(response.status_code, 200)
        # Check that an IncidentReport was created
        self.assertEqual(IncidentReport.objects.count(), 1)

    def test_resolve_incident(self):
        # Create a new incident report
        new_incident_report_data = {
            "location": {
                "latitude": 0.0,
                "longitude": 0.0,
            },
        }
        response = self.client.post(
            "/api/report-incident", data=new_incident_report_data, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(IncidentReport.objects.count(), 1)

        # Get the created incident report
        incident_report = IncidentReport.objects.first()

        # Resolve the incident
        resolve_incident_data = {
            "incident_id": incident_report.id,
        }
        response = self.client.post(
            "/api/resolve-incident", data=resolve_incident_data, format="json"
        )
        self.assertEqual(response.status_code, 200)

        # Check that the incident report is resolved
        incident_report.refresh_from_db()
        self.assertIsNotNone(incident_report.resolved_at)
