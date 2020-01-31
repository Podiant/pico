from django.contrib.auth.models import User
from django.test import TestCase


class CreateProjectViewTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            'jo',
            'jo@example.com',
            'correct-horse-battery-staple'
        )

    def test_get(self):
        self.client.login(
            email='jo@example.com',
            password='correct-horse-battery-staple'
        )

        response = self.client.get('/projects/create/')
        self.assertEqual(response.status_code, 403)
