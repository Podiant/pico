from django.test import TestCase


class BoardDetailViewTests(TestCase):
    fixtures = (
        'test_user_onboarded',
        'test_board',
        'test_project',
        'test_project_board'
    )

    def test_get_anonymous(self):
        response = self.client.get('/projects/5e33ed6882a00/episodes/')
        self.assertEqual(response.status_code, 302)

    def test_get_authenticated(self):
        self.client.login(
            email='jo@example.com',
            password='correct-horse-battery-staple'
        )

        response = self.client.get('/projects/5e33ed6882a00/episodes/')
        self.assertEqual(response.status_code, 200)
