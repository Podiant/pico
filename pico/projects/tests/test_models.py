from datetime import datetime
from django.conf import settings
from django.contrib.auth.models import User
from django.core.files import File
from django.test import TestCase
from django.utils import timezone
from mock import patch
from ..models import Project, Deliverable
import os


now = datetime(2020, 1, 1, 0, 0, 0, tzinfo=timezone.utc)


class ProjectTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            'jo',
            'jo@example.com',
            'correct-horse-battery-staple'
        )

    @patch('time.time', lambda: 1580461416)
    @patch('django.core.files.storage.FileSystemStorage.save')
    def test_upload_project_image(self, mock_save):
        mock_save.return_value = '5e33ed6882a00.png'
        image_filename = os.path.join(
            settings.BASE_DIR,
            'pico',
            'projects',
            'fixtures',
            'square@64w.png'
        )

        with open(image_filename, 'rb') as image:
            project = Project.objects.create(
                name='The Foo Show',
                creator=self.user,
                artwork=File(image)
            )

        self.assertEqual(str(project), 'The Foo Show')
        self.assertEqual(project.slug, '5e33ed6882a00')
        self.assertTrue(
            project.user_has_perm(
                self.user,
                'change_project',
                'delete_project'
            )
        )

        self.assertFalse(
            project.user_has_perm(self.user, 'rule_world')
        )


class TaskTests(TestCase):
    fixtures = (
        'test_user_onboarded',
        'test_project',
        'test_board',
        'test_project_board',
        'test_project_stages',
        'test_project_deliverable'
    )

    def setUp(self):
        self.deliverable = Deliverable.objects.get()

    def test_advance(self):
        for stage in self.deliverable.project.stages.all():
            for task in stage.tasks.all():
                task.completion_date = now
                task.save()
