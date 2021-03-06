from django.test import TestCase
from ...models import Project


class DeliverableDetailViewTests(TestCase):
    fixtures = (
        'test_user_onboarded',
        'test_board',
        'test_project',
        'test_project_board'
    )

    def setUp(self):
        project = Project.objects.get()
        project.deliverables.create(
            name='Episode one',
            slug='5e357991165ac'
        )

    def test_get_anonymous(self):
        response = self.client.get(
            '/projects/5e33ed6882a00/deliverables/5e357991165ac/'
        )

        self.assertEqual(response.status_code, 302)

    def test_get_authenticated(self):
        self.client.login(
            email='jo@example.com',
            password='correct-horse-battery-staple'
        )

        response = self.client.get(
            '/projects/5e33ed6882a00/deliverables/5e357991165ac/'
        )

        self.assertEqual(response.status_code, 200)
