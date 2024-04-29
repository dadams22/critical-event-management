from criticalevents.tests.libs.base_test_case import BaseTestCase

from criticalevents.models import Alert


class AlertViewSetTest(BaseTestCase):
    def setUp(self):
        super().setUp()

        new_incident_report_data = {
            "location": {
                "latitude": 0.0,
                "longitude": 0.0,
            },
        }
        response = self.client.post(
            "/api/report_incident", data=new_incident_report_data, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.incident_report_id = response.data["incident_report"]["id"]

    def test_create_alert(self):
        # Authenticate the user

        # Define the new alert data
        new_alert_data = {
            "body": "New Alert",
            "incident_report": self.incident_report_id,
        }

        # Make a POST request to the AlertViewSet
        response = self.client.post("/api/alert/", data=new_alert_data, format="json")

        if response.status_code != 201:
            print(response.content)

        # Check that the status code is 201 (created)
        self.assertEqual(response.status_code, 201)

        # Retrieve the newly created alert from the database
        alert = Alert.objects.get(id=response.data["alert"]["id"])

        # Check that the body of the new alert is correct
        self.assertEqual(alert.body, "New Alert")
