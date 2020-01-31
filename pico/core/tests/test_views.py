from django.test import TestCase


class HomeViewTests(TestCase):
    def test_get_fresh(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response['Location'], '/projects/')
