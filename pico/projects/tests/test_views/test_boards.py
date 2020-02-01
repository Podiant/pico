from django.test import TestCase


class BoardDetailViewTests(TestCase):
    fixtures = (
        'test_user_onboarded',
        'test_board',
        'test_project',
        'test_project_board'
    )

    def setUp(self):
        self.client.login(
            email='jo@example.com',
            password='correct-horse-battery-staple'
        )

    def test_get(self):
        response = self.client.get('/projects/5e33ed6882a00/episodes/')
        self.assertEqual(response.status_code, 200)
