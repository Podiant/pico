from django.conf import settings
from django.contrib.auth.models import User
from django.core.files import File
from django.test import TestCase
from mock import patch
from ..models import Project
import os


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
            project.user_can(
                self.user,
                'update_project',
                'delete_project'
            )
        )

        self.assertFalse(project.user_can(self.user, 'rule_world'))
