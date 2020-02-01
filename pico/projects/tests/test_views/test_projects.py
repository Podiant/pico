from django.test import TestCase
from mock import patch
from ...models import Project


class ProjectListViewTests(TestCase):
    def test_get_fresh(self):
        response = self.client.get('/projects/')
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response['Location'], '/onboarding/')


class CreateProjectViewTests(TestCase):
    fixtures = ('test_user_onboarded',)

    def setUp(self):
        self.client.login(
            email='jo@example.com',
            password='correct-horse-battery-staple'
        )

    def test_get(self):
        response = self.client.get('/projects/create/')
        self.assertEqual(response.status_code, 200)

    @patch('pico.projects.helpers.set_artwork_from_apple')
    @patch('time.time', lambda: 1580461416)
    def test_post(self, mocked_set_artwork_from_apple):
        response = self.client.post(
            '/projects/create/',
            {
                'name': 'The Foo Show',
                'apple_podcasts_id': '1475607479'
            }
        )

        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response['Location'],
            '/projects/5e33ed6882a00/episodes/'
        )

        obj = Project.objects.get()
        self.assertEqual(
            obj.directory_listings.get().url,
            'https://podcasts.apple.com/podcast/id1475607479'
        )

        board = obj.boards.get(slug='episodes')
        self.assertTrue(board.columns.exists())

        self.assertTrue(
            board.user_has_perm(obj.creator, 'add_column')
        )

        self.assertFalse(
            board.user_has_perm(obj.creator, 'rule_world')
        )


class UpdateProjectViewTests(TestCase):
    fixtures = (
        'test_user_onboarded',
        'test_project'
    )

    def setUp(self):
        self.client.login(
            email='jo@example.com',
            password='correct-horse-battery-staple'
        )

    def test_post(self):
        response = self.client.post(
            '/projects/5e33ed6882a00/settings/',
            {
                'name': 'The Foo Show'
            }
        )

        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response['Location'],
            '/projects/5e33ed6882a00/'
        )


class ProjectDetailTests(TestCase):
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
        response = self.client.get('/projects/5e33ed6882a00/')
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response['Location'],
            '/projects/5e33ed6882a00/episodes/'
        )
