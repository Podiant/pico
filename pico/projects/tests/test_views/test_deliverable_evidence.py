from django.core.cache import cache
from django.conf import settings
from django.test import TestCase
from uuid import UUID
from mock import patch
from ...models import Task
import os
import json


GUID = '36514c1f-4cfb-412a-8c64-15030818cbef'


class DeliverableEvidenceViewTests(TestCase):
    fixtures = (
        'test_user_onboarded',
        'test_board',
        'test_project',
        'test_project_board',
        'test_project_stages',
        'test_activity_stream',
        'test_project_deliverable'
    )

    def test_post_anonymous(self):
        response = self.client.post(
            '/projects/5e33ed6882a00/deliverables/5e3aa17e6f93f/evidence/'
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response['Content-Type'], 'application/json')
        response = json.loads(response.content)
        self.assertEqual(response['status'], 403)

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

    @patch('uuid.uuid4', lambda: UUID(GUID))
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
        upload = response['data']
        self.assertEqual(upload['size'], 387)

        filename = cache.get('files.%s' % GUID)
        self.assertTrue(os.path.exists(filename))
        self.assertEqual(os.path.getsize(filename), 387)


class MockStat(object):
    st_size = 512


class DeliverableEvidenceDownloadViewTests(TestCase):
    fixtures = (
        'test_user_onboarded',
        'test_board',
        'test_project',
        'test_project_board',
        'test_project_stages',
        'test_activity_stream',
        'test_project_deliverable',
        'test_project_deliverable_evidence'
    )

    @patch('os.stat', lambda f: MockStat())
    def test_head_anonymous(self):
        response = self.client.head(
            '/projects/5e33ed6882a00/deliverables/5e3aa17e6f93f/evidence/5e3fd9fa1e1ab.mp3'  # NOQA
        )

        self.assertEqual(response.status_code, 302)

    @patch('os.stat', lambda f: MockStat())
    def test_head_authenticated(self):
        self.client.login(
            email='jo@example.com',
            password='correct-horse-battery-staple'
        )

        response = self.client.head(
            '/projects/5e33ed6882a00/deliverables/5e3aa17e6f93f/evidence/5e3fd9fa1e1ab.mp3'  # NOQA
        )

        self.assertEqual(response['Content-Type'], 'application/zip')
        self.assertEqual(response['Content-Length'], '512')
        self.assertEqual(
            response['Content-Disposition'],
            'attachment; filename=foo.zip'
        )

        task = Task.objects.get(pk=8)
        self.assertIsNone(task.completion_date)
        self.assertIsNone(task.completed_by)
        self.assertNotIn('X-Accel-Redirect', response)

    @patch('os.stat', lambda f: MockStat())
    def test_get_authenticated(self):
        self.client.login(
            email='jo@example.com',
            password='correct-horse-battery-staple'
        )

        response = self.client.get(
            '/projects/5e33ed6882a00/deliverables/5e3aa17e6f93f/evidence/5e3fd9fa1e1ab.mp3'  # NOQA
        )

        self.assertEqual(response['Content-Type'], 'application/zip')
        self.assertEqual(response['Content-Length'], '512')
        self.assertEqual(
            response['Content-Disposition'],
            'attachment; filename=foo.zip'
        )

        self.assertIn('X-Accel-Redirect', response)

        task = Task.objects.get(pk=8)
        self.assertEqual(task.completed_by.username, 'jo')
