from criticalevents.tests.libs.base_test_case import BaseTestCase

from criticalevents.models import AssetType, Organization


class AssetTypeViewSetTest(BaseTestCase):
    def setUp(self):
        super().setUp()

        self.asset_type = AssetType.objects.create(
            name="Test AssetType", organization=self.organization
        )

    def test_get_asset_types(self):
        response = self.client.get(
            "/api/asset_type/"
        )  # replace with your actual AssetTypeViewSet url

        if response.status_code == 401:
            print(response.content)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Test AssetType")

    def test_create_asset_type(self):
        # Authenticate the user
        self.client.login(username="testuser", password="12345")

        # Define the new asset type data
        new_asset_type_data = {
            "name": "New AssetType",
        }

        # Make a POST request to the AssetTypeViewSet
        response = self.client.post("/api/asset_type/", data=new_asset_type_data)

        if response.status_code != 201:
            print(response.content)

        # Check that the status code is 201 (created)
        self.assertEqual(response.status_code, 201)

        # Retrieve the newly created asset type from the database
        asset_type = AssetType.objects.get(id=response.data["id"])

        # Check that the name of the new asset type is correct
        self.assertEqual(asset_type.name, "New AssetType")

    def test_get_asset_types_from_different_organization(self):
        # Create a new organization and asset type
        other_organization = Organization.objects.create(name="Other Organization")
        other_asset_type = AssetType.objects.create(
            name="Other Asset Type", organization=other_organization
        )

        # Make a GET request to the AssetTypeViewSet
        response = self.client.get(
            "/api/asset_type/"
        )  # replace with your actual AssetTypeViewSet url

        # Check that the status code is 200
        self.assertEqual(response.status_code, 200)

        # Check that the response data does not include the other asset type
        self.assertNotIn(
            "Other Asset Type", [asset_type["name"] for asset_type in response.data]
        )
