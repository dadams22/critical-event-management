from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, Client
from django.contrib.auth import get_user_model

User = get_user_model()
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient
from criticalevents.models import Site, Organization
from criticalevents.models import Floor, Site


class FloorViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.organization = Organization.objects.create(name="Test Organization")
        self.user = User.objects.create_user(
            username="testuser", password="12345", organization=self.organization
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION="Token " + self.token.key)
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

    def test_get_floors(self):
        response = self.client.get(
            "/api/floor/"
        )  # replace with your actual FloorViewSet url

        if response.status_code == 401:
            print(response.content)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Test Floor")

    def test_create_floor_in_current_site(self):
        # Authenticate the user
        self.client.login(username="testuser", password="12345")

        # Create a dummy image file
        image = Image.new("RGB", (100, 100))
        image_file = BytesIO()
        image.save(image_file, "JPEG")
        image_file.seek(0)

        # Define the new floor data
        new_floor_data = {
            "name": "New Floor",
            "site": self.site.id,
            "sort_order": 2,
            "floor_plan_bounds": "{}",
            "floor_plan": SimpleUploadedFile(
                "floor_plan.jpg", image_file.read(), content_type="image/jpeg"
            ),
        }

        # Make a POST request to the FloorViewSet
        response = self.client.post("/api/floor/", data=new_floor_data)

        if response.status_code != 201:
            print(response.content)

        # Check that the status code is 201 (created)
        self.assertEqual(response.status_code, 201)

        # Retrieve the newly created floor from the database
        floor = Floor.objects.get(id=response.data["id"])

        # Check that the site of the new floor is the same as the current user's site
        self.assertEqual(floor.site.id, self.site.id)

    def test_get_floors_from_different_organization(self):
        # Create a new organization, site, and floor
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

        # Make a GET request to the FloorViewSet
        response = self.client.get(
            "/api/floor/"
        )  # replace with your actual FloorViewSet url

        # Check that the status code is 200
        self.assertEqual(response.status_code, 200)

        # Check that the response data does not include the other floor
        self.assertNotIn("Other Floor", [floor["name"] for floor in response.data])
