from django.contrib.auth import get_user_model

from criticalevents.tests.libs.base_test_case import BaseTestCase

from criticalevents.models import Organization, AssetType, Asset, Floor, Site


class AssetViewSetTest(BaseTestCase):
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
            name="Test AssetType", organization=self.organization
        )
        self.asset = Asset.objects.create(
            name="Test Asset",
            asset_type=self.asset_type,
            floor=self.floor,
            longitude=0.0,
            latitude=0.0,
            organization=self.organization,
        )

    def test_get_assets(self):
        response = self.client.get(
            "/api/asset/"
        )  # replace with your actual AssetViewSet url

        if response.status_code == 401:
            print(response.content)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Test Asset")

    def test_create_asset(self):
        # Authenticate the user
        self.client.login(username="testuser", password="12345")

        # Define the new asset data
        new_asset_data = {
            "name": "New Asset",
            "asset_type": self.asset_type.id,
            "floor": self.floor.id,
            "longitude": 0.0,
            "latitude": 0.0,
            "next_maintenance_date": "2022-01-01",
        }

        # Make a POST request to the AssetViewSet
        response = self.client.post("/api/asset/", data=new_asset_data, format="json")

        if response.status_code != 201:
            print(response.content)

        assert response.data["asset_type"]["name"] == self.asset_type.name

        # Check that the status code is 201 (created)
        self.assertEqual(response.status_code, 201)

        # Retrieve the newly created asset from the database
        asset = Asset.objects.get(id=response.data["id"])

        # Check that the name of the new asset is correct
        self.assertEqual(asset.name, "New Asset")

    def test_get_assets_from_different_organization(self):
        # Create a new organization, site, floor, asset type, and asset
        other_organization = Organization.objects.create(name="Other Organization")
        other_site = Site.objects.create(
            name="Other Site",
            organization=other_organization,
            longitude=0.0,
            latitude=0.0,
            bounds="{}",
            floor_plan_bounds="{}",
        )
        other_floor = Floor.objects.create(
            name="Other Floor",
            site=other_site,
            sort_order=1,
            floor_plan_bounds="{}",
            organization=other_organization,
        )
        other_asset_type = AssetType.objects.create(
            name="Other Asset Type", organization=other_organization
        )
        other_asset = Asset.objects.create(
            name="Other Asset",
            asset_type=other_asset_type,
            floor=other_floor,
            longitude=0.0,
            latitude=0.0,
            organization=other_organization,
        )

        # Make a GET request to the AssetViewSet
        response = self.client.get(
            "/api/asset/"
        )  # replace with your actual AssetViewSet url

        # Check that the status code is 200
        self.assertEqual(response.status_code, 200)

        # Check that the response data does not include the other asset
        self.assertNotIn("Other Asset", [asset["name"] for asset in response.data])

    def test_asset_with_maintenance_status(self):
        # Authenticate the user
        self.client.login(username="testuser", password="12345")

        # Define the new asset data
        new_asset_data = {
            "name": "New Asset",
            "asset_type": self.asset_type.id,
            "floor": self.floor.id,
            "longitude": 0.0,
            "latitude": 0.0,
            "next_maintenance_date": "2022-01-01",
        }

        # Make a POST request to the AssetViewSet
        response = self.client.post("/api/asset/", data=new_asset_data, format="json")

        if response.status_code != 201:
            print(response.content)

        # Check that the status code is 201 (created)
        self.assertEqual(response.status_code, 201)

        # Retrieve the newly created asset from the database
        asset = Asset.objects.get(id=response.data["id"])

        # Check that the maintenance status of the new asset is correct
        self.assertEqual(asset.maintenance_status, "OUT_OF_COMPLIANCE")

    def test_get_asset_with_maintenance_log(self):
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

        # Make a GET request to the AssetViewSet to retrieve the asset with the maintenance log
        response = self.client.get(f"/api/asset/{self.asset.id}/")

        if response.status_code != 200:
            print(response.content)

        # Check that the status code is 200
        self.assertEqual(response.status_code, 200)

        # Check that the maintenance log notes are correct
        self.assertEqual(response.data["maintenance_logs"][0]["notes"], "hello there")
        self.assertEqual(
            response.data["maintenance_logs"][0]["reported_by"]["id"], self.user.id
        )
