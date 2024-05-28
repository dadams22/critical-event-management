from criticalevents.tests.libs.base_test_case import BaseTestCase

from criticalevents.models import (
    Site,
    Building,
    Floor,
    AssetType,
    Asset,
    MaintenanceLog,
)


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
        self.building = Building.objects.create(
            name="Test Building", site=self.site, organization=self.organization
        )
        self.floor = Floor.objects.create(
            name="Test Floor",
            building=self.building,
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

    def test_create_maintenance_log_with_next_maintenance_date(self):
        # Prepare the maintenance log data
        data = {
            "notes": "Test maintenance log",
            "asset": self.asset.id,
            "next_maintenance_date": "2023-01-01",
        }

        # Send a POST request to create a new maintenance log
        response = self.client.post("/api/maintenance_log/", data, format="json")

        assert response.status_code == 201, response.content

        # Assert that the next_maintenance_date of the asset was updated
        self.asset.refresh_from_db()
        assert str(self.asset.next_maintenance_date) == data["next_maintenance_date"]
