from django.test import TestCase
from mock import patch
from ...models import Project


class FreshProjectListViewTests(TestCase):
    def test_get_fresh(self):
        response = self.client.get('/projects/')
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response['Location'], '/onboarding/')


class OnboardedListViewTests(TestCase):
    fixtures = ('test_user_onboarded',)

    def test_get_anonymous(self):
        response = self.client.get('/projects/')
        self.assertEqual(response.status_code, 302)
        self.assertTrue(
            response['Location'].startswith(
                '/accounts/login/'
            )
        )

    def test_get_authenticated(self):
        self.client.login(
            email='jo@example.com',
            password='correct-horse-battery-staple'
        )

        response = self.client.get('/projects/')
        self.assertEqual(response.status_code, 200)


class CreateProjectViewTests(TestCase):
    fixtures = ('test_user_onboarded',)

    def test_get_anonymous(self):
        response = self.client.get('/projects/create/')
        self.assertEqual(response.status_code, 302)

    def test_get_authenticated(self):
        self.client.login(
            email='jo@example.com',
            password='correct-horse-battery-staple'
        )

        response = self.client.get('/projects/create/')
        self.assertEqual(response.status_code, 200)

    @patch('pico.projects.helpers.set_artwork_from_apple')
    @patch('time.time', lambda: 1580461416)
    def test_post_authenticated(self, mocked_set_artwork_from_apple):
        self.client.login(
            email='jo@example.com',
            password='correct-horse-battery-staple'
        )

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

    def test_post_anonymous(self):
        response = self.client.post(
            '/projects/5e33ed6882a00/settings/',
            {
                'name': 'The Foo Show'
            }
        )

        self.assertEqual(response.status_code, 302)
        self.assertTrue(
            response['Location'].startswith(
                '/accounts/login/'
            )
        )

    def test_post_authenticated(self):
        self.client.login(
            email='jo@example.com',
            password='correct-horse-battery-staple'
        )

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


class ProjectDetailViewTests(TestCase):
    fixtures = (
        'test_user_onboarded',
        'test_board',
        'test_project',
        'test_project_board'
    )

    def test_get_anonymous(self):
        response = self.client.get('/projects/5e33ed6882a00/')
        self.assertEqual(response.status_code, 302)
        self.assertTrue(
            response['Location'].startswith(
                '/accounts/login/'
            )
        )

    def test_get_authenticated(self):
        self.client.login(
            email='jo@example.com',
            password='correct-horse-battery-staple'
        )

        response = self.client.get('/projects/5e33ed6882a00/')
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response['Location'],
            '/projects/5e33ed6882a00/episodes/'
        )
