from criticalevents.tests.libs.base_test_case import BaseTestCase
from criticalevents.tests.libs.images import (
    generate_upload_image,
    generate_upload_image_base64,
)

from criticalevents.models import Site, Organization


class SiteViewSetTest(BaseTestCase):
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

    def test_get_sites(self):
        response = self.client.get(
            "/api/site/"
        )  # replace with your actual SiteViewSet url

        if response.status_code == 401:
            print(response.content)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Test Site")

    def test_get_sites_from_different_organization(self):
        # Create a new organization and site
        other_organization = Organization.objects.create(name="Other Organization")
        other_site = Site.objects.create(
            name="Other Site",
            organization=other_organization,
            longitude=0.0,
            latitude=0.0,
            bounds="{}",
            floor_plan_bounds="{}",
        )

        # Make a GET request to the SiteViewSet
        response = self.client.get(
            "/api/site/"
        )  # replace with your actual SiteViewSet url

        # Check that the status code is 200
        self.assertEqual(response.status_code, 200)

        # Check that the response data does not include the other site
        self.assertNotIn("Other Site", [site["name"] for site in response.data])

    def test_create_site_in_current_organization(self):
        # Authenticate the user
        self.client.login(username="testuser", password="12345")

        # Define the new site data
        new_site_data = {
            "name": "New Site",
            "longitude": 0.0,
            "latitude": 0.0,
            "bounds": "{}",
            "floor_plan_bounds": "{}",
            "address": "123 Main St",
            "floor_plan": generate_upload_image(),
            "floors": [],
        }

        # Make a POST request to the SiteViewSet
        response = self.client.post("/api/site/", data=new_site_data)

        if response.status_code != 201:
            print(response.content)

        # Check that the status code is 201 (created)
        self.assertEqual(response.status_code, 201)

        # Retrieve the newly created site from the database
        site = Site.objects.get(id=response.data["id"])

        # Check that the organization of the new site is the same as the current user's organization
        self.assertEqual(site.organization.id, self.organization.id)

    def test_create_site_with_floor(self):
        # Authenticate the user
        self.client.login(username="testuser", password="12345")

        # Define the new site data
        new_site_data = {
            "name": "New Site",
            "longitude": 0.0,
            "latitude": 0.0,
            "bounds": "{}",
            "floor_plan_bounds": "{}",
            "address": "123 Main St",
            "floor_plan": generate_upload_image_base64(),
            "buildings": [
                {
                    "name": "Building 1",
                    "floors": [
                        {
                            "name": "Floor 1",
                            "sort_order": 1,
                            "floor_plan": generate_upload_image_base64(),
                            "floor_plan_bounds": [1, 2],
                        }
                    ],
                }
            ],
        }

        # Make a POST request to the SiteViewSet
        response = self.client.post("/api/site/", data=new_site_data, format="json")

        if response.status_code != 201:
            print(response.content)

        # Check that the status code is 201 (created)
        self.assertEqual(response.status_code, 201)

        # Retrieve the newly created site from the database
        site = Site.objects.get(id=response.data["id"])

        # Check that the organization of the new site is the same as the current user's organization
        self.assertEqual(site.organization.id, self.organization.id)

        buildings = site.buildings.all()
        self.assertEqual(len(buildings), 1)

        floors = buildings[0].floors.all()
        self.assertEqual(len(floors), 1)

    def test_create_site_with_floor_unstringed_bounds(self):
        # Authenticate the user
        self.client.login(username="testuser", password="12345")

        # Define the new site data
        new_site_data = {
            "name": "New Site",
            "longitude": 0.0,
            "latitude": 0.0,
            "bounds": [1, 2],
            "floor_plan_bounds": "{}",
            "address": "123 Main St",
            "floor_plan": generate_upload_image_base64(),
            "buildings": [
                {
                    "name": "Building 1",
                    "floors": [
                        {
                            "name": "Floor 1",
                            "sort_order": 1,
                            "floor_plan": generate_upload_image_base64(),
                            "floor_plan_bounds": [1, 2],
                        }
                    ],
                }
            ],
        }

        # Make a POST request to the SiteViewSet
        response = self.client.post("/api/site/", data=new_site_data, format="json")

        if response.status_code != 201:
            print(response.content)

        # Check that the status code is 201 (created)
        self.assertEqual(response.status_code, 201)

        # Retrieve the newly created site from the database
        site = Site.objects.get(id=response.data["id"])

        # Check that the organization of the new site is the same as the current user's organization
        self.assertEqual(site.organization.id, self.organization.id)

        buildings = site.buildings.all()
        self.assertEqual(len(buildings), 1)

        floors = buildings[0].floors.all()
        self.assertEqual(len(floors), 1)
