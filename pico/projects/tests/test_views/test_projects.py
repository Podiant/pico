from django.test import TestCase


class CreateProjectViewTests(TestCase):
    fixtures = ('test_user_onboarded',)

    def test_get(self):
        self.client.login(
            email='jo@example.com',
            password='correct-horse-battery-staple'
        )

        response = self.client.get('/projects/create/')
        self.assertEqual(response.status_code, 200)
