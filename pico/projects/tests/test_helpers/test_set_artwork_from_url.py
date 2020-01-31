from django.test import TestCase
from mock import patch
from . import mock_request
from ...helpers import set_artwork_from_url
from ...models import Project


class SetArtworkFromUrlTests(TestCase):
    fixtures = (
        'test_user_onboarded.json',
        'test_project.json'
    )

    def setUp(self):
        self.project = Project.objects.get()

    @patch('requests.get', mock_request())
    def test_working(self):
        set_artwork_from_url(
            self.project,
            'https://media.podiant.co/spoke/listenvy/artwork.png'
        )
