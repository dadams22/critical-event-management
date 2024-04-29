from criticalevents.tests.libs.base_test_case import BaseTestCase

from criticalevents.models import Site, Floor, AssetType, Asset, MaintenanceLog


class TestMaintenanceLog(BaseTestCase):
    def setUp(self):
        super().setUp()

        self.site = Site.objects.create(
            name="Test Site",
            organization=self.organization,
            longitude=0.0,
            latitude=0.0,
            bounds="{}",
            floor_plan_bounds="{}",
        )
        self.floor = Floor.objects.create(
            name="Test Floor",
            site=self.site,
            sort_order=1,
            floor_plan_bounds="{}",
            organization=self.organization,
        )
        self.asset_type = AssetType.objects.create(
            name="Test Asset Type", organization=self.organization
        )
        self.asset = Asset.objects.create(
            name="Test Asset",
            floor=self.floor,
            longitude=0.0,
            latitude=0.0,
            organization=self.organization,
            asset_type=self.asset_type,
        )

    def test_create_mainenance_log(self):
        # Authenticate the user
        self.client.login(username="testuser", password="12345")

        # Define the new maintenance log data
        new_maintenance_log_data = {
            "asset": self.asset.id,
            "notes": "hello there",
        }

        # Make a POST request to the MaintenanceLogViewSet
        response = self.client.post(
            "/api/maintenance_log/", data=new_maintenance_log_data, format="json"
        )

        if response.status_code != 201:
            print(response.content)

        # Check that the status code is 201 (created)
        self.assertEqual(response.status_code, 201)

        response = self.client.get(f"/api/asset/{self.asset.id}/")

        if response.status_code != 200:
            print(response.content)
            print(response.headers)

        self.assertEqual(response.status_code, 200)

        self.assertEqual(response.data["maintenance_logs"][0]["notes"], "hello there")
