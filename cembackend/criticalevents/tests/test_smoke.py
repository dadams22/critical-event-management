from django.test import LiveServerTestCase


class PingTestCase(LiveServerTestCase):
    def test_ping(self):
        response = self.client.get("/api/ping")
        self.assertEqual(response.status_code, 200)
