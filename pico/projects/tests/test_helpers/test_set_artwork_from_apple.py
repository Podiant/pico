from django.test import TestCase
from mock import patch
from . import mock_request
from ...helpers import set_artwork_from_apple
from ...models import Project


class SetArtworkFromAppleTests(TestCase):
    fixtures = (
        'test_user_onboarded.json',
        'test_project.json'
    )

    def setUp(self):
        self.project = Project.objects.get()

    @patch('pico.projects.helpers.set_artwork_from_feed')
    @patch('requests.get', mock_request())
    def test_working(self, mocked_set_artwork_from_feed):
        set_artwork_from_apple(self.project, '1475607479')
