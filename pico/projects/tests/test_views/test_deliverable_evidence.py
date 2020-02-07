from django.conf import settings
from django.test import TestCase
import os
import json


class DeliverableEvidenceViewTests(TestCase):
    fixtures = (
        'test_user_onboarded',
        'test_board',
        'test_project',
        'test_project_board',
        'test_project_stages',
        'test_project_deliverable'
    )

    def test_get_authenticated(self):
        self.client.login(
            email='jo@example.com',
            password='correct-horse-battery-staple'
        )

        response = self.client.get(
            '/projects/5e33ed6882a00/deliverables/5e3aa17e6f93f/evidence/'
        )

        self.assertEqual(response.status_code, 405)
        self.assertEqual(response['Content-Type'], 'application/json')
        response = json.loads(response.content)
        self.assertEqual(response['status'], 405)

    def test_post_anonymous(self):
        response = self.client.post(
            '/projects/5e33ed6882a00/deliverables/5e3aa17e6f93f/evidence/'
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response['Content-Type'], 'application/json')
        response = json.loads(response.content)
        self.assertEqual(response['status'], 403)

    def test_post_authenticated_not_found(self):
        self.client.login(
            email='jo@example.com',
            password='correct-horse-battery-staple'
        )

        response = self.client.post(
            '/projects/5e33ed6882a00/deliverables/5e3d524b14582/evidence/'
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response['Content-Type'], 'application/json')
        response = json.loads(response.content)
        self.assertEqual(response['status'], 404)

    def test_post_authenticated_no_files(self):
        self.client.login(
            email='jo@example.com',
            password='correct-horse-battery-staple'
        )

        response = self.client.post(
            '/projects/5e33ed6882a00/deliverables/5e3aa17e6f93f/evidence/'
        )

        self.assertEqual(response.status_code, 422)
        self.assertEqual(response['Content-Type'], 'application/json')
        response = json.loads(response.content)
        self.assertEqual(response['status'], 422)
        self.assertEqual(
            response['detail']['__all__'],
            'No files submitted'
        )

    def test_post_authenticated(self):
        self.client.login(
            email='jo@example.com',
            password='correct-horse-battery-staple'
        )

        filename = os.path.join(
            settings.BASE_DIR,
            'pico',
            'projects',
            'fixtures',
            'square@64w.png'
        )

        with open(filename, 'rb') as media:
            response = self.client.post(
                '/projects/5e33ed6882a00/deliverables/5e3aa17e6f93f/evidence/',
                {
                    'files[]': media
                }
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/json')
        response = json.loads(response.content)
        files = response[0]
        self.assertEqual(files['size'], 387)
