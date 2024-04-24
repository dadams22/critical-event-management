from django.test import TestCase, Client
from django.contrib.auth import get_user_model
User = get_user_model()
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient
from criticalevents.models import Site, Organization

class SiteViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.organization = Organization.objects.create(name='Test Organization')
        self.user = User.objects.create_user(username='testuser', password='12345', organization=self.organization)
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.site = Site.objects.create(name='Test Site', organization=self.organization, longitude=0.0, latitude=0.0, bounds='{}', floor_plan_bounds='{}')

    def test_get_sites(self):
        response = self.client.get('/api/site/')  # replace with your actual SiteViewSet url

        if response.status_code == 401:
            print(response.content)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test Site')

    def test_get_sites_from_different_organization(self):
        # Create a new organization and site
        other_organization = Organization.objects.create(name='Other Organization')
        other_site = Site.objects.create(name='Other Site', organization=other_organization, longitude=0.0, latitude=0.0, bounds='{}', floor_plan_bounds='{}')

        # Make a GET request to the SiteViewSet
        response = self.client.get('/api/site/')  # replace with your actual SiteViewSet url

        # Check that the status code is 200
        self.assertEqual(response.status_code, 200)

        # Check that the response data does not include the other site
        self.assertNotIn('Other Site', [site['name'] for site in response.data])
