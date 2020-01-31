from django.contrib.auth.models import User
from django.contrib.sites.models import Site
from django.test import TestCase


class OnboardingViewFreshTests(TestCase):
    def test_get(self):
        response = self.client.get('/onboarding/')
        self.assertEqual(response.status_code, 200)

    def test_post_email_exists(self):
        User.objects.create_user(
            'jo',
            'jo@example.com',
            'correct-horse-battery-staple'
        )

        response = self.client.post(
            '/onboarding/',
            {
                'site_name': 'Bloggs.fm',
                'name': 'Jo Bloggs',
                'email': 'jo@example.com',
                'password1': 'correct-horse-battery-staple',
                'password2': 'correct-horse-battery-staple'
            }
        )

        self.assertEqual(response.status_code, 200)
        form = response.context['form']
        self.assertEqual(
            form['email'].errors[0],
            (
                'Looks like someone has already signed up, and used that '
                'email address.'
            )
        )

    def test_post_password_mismatch(self):
        response = self.client.post(
            '/onboarding/',
            {
                'site_name': 'Bloggs.fm',
                'name': 'Jo Bloggs',
                'email': 'jo@example.com',
                'password1': 'correct-horse-battery-staple',
                'password2': 'right-pony-aa-tack'
            }
        )

        self.assertEqual(response.status_code, 200)
        form = response.context['form']
        self.assertEqual(
            form['password2'].errors[0],
            'The two password fields didn’t match.'
        )

    def test_post_single_name(self):
        response = self.client.post(
            '/onboarding/',
            {
                'site_name': 'Bloggs.fm',
                'name': 'jo',
                'email': 'jo@example.com',
                'password1': 'correct-horse-battery-staple',
                'password2': 'correct-horse-battery-staple'
            }
        )

        self.assertEqual(response.status_code, 302)
        user = User.objects.get()
        self.assertEqual(user.get_full_name(), 'Jo')

    def test_post(self):
        response = self.client.post(
            '/onboarding/',
            {
                'site_name': 'Bloggs.fm',
                'name': 'jo bloggs',
                'email': 'jo@example.com',
                'password1': 'correct-horse-battery-staple',
                'password2': 'correct-horse-battery-staple'
            },
            SERVER_NAME='bloggs.fm'
        )

        self.assertEqual(response.status_code, 302)
        user = User.objects.get()
        self.assertEqual(user.get_full_name(), 'Jo Bloggs')
        self.assertTrue(user.has_perm('projects.add_project'))

        site = Site.objects.get_current()
        self.assertEqual(site.name, 'Bloggs.fm')
        self.assertEqual(site.domain, 'bloggs.fm')


class OnboardingViewRevisitedTests(TestCase):
    def setUp(self):
        User.objects.create_user(
            'jo',
            'jo@example.com',
            'correct-horse-battery-staple'
        )

    def test_get(self):
        response = self.client.get('/onboarding/')
        self.assertEqual(response.status_code, 302)
