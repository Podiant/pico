from django.test import TestCase
from mock import patch


class CreateProjectViewTests(TestCase):
    fixtures = ('test_user_onboarded',)

    def test_get(self):
        self.client.login(
            email='jo@example.com',
            password='correct-horse-battery-staple'
        )

        response = self.client.get('/projects/create/')
        self.assertEqual(response.status_code, 200)

    @patch('time.time', lambda: 1580461416)
    def test_post(self):
        self.client.login(
            email='jo@example.com',
            password='correct-horse-battery-staple'
        )

        response = self.client.post(
            '/projects/create/',
            {
                'name': 'The Foo Show'
            }
        )

        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response['Location'],
            '/projects/5e33ed6882a00/settings/'
        )


class UpdateProjectViewTests(TestCase):
    fixtures = (
        'test_user_onboarded',
        'test_project'
    )

    def test_post(self):
        self.client.login(
            email='jo@example.com',
            password='correct-horse-battery-staple'
        )

        response = self.client.post(
            '/projects/5e33ed6882a00/settings/',
            {
                'name': 'The Foo Show'
            }
        )

        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response['Location'],
            '/projects/5e33ed6882a00/settings/'
        )
