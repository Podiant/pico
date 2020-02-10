from django.contrib.auth.models import User, Permission
from django.test import TestCase
from pico.kanban.models import Board
from ...models import Project


class ProjectManagerMixin(TestCase):
    fixtures = (
        'test_user_onboarded',
        'test_board',
        'test_project',
        'test_project_board'
    )


class ProjectManagerListViewTests(ProjectManagerMixin):
    def test_get_anonymous(self):
        response = self.client.get('/projects/5e33ed6882a00/managers/')
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

        response = self.client.get('/projects/5e33ed6882a00/managers/')
        self.assertEqual(response.status_code, 200)


class ProjectManagerUpdateViewTests(ProjectManagerMixin):
    def test_get_anonymous(self):
        response = self.client.get('/projects/5e33ed6882a00/managers/1/')
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

        response = self.client.get('/projects/5e33ed6882a00/managers/1/')
        self.assertEqual(response.status_code, 200)

    def test_post_authenticated(self):
        self.client.login(
            email='jo@example.com',
            password='correct-horse-battery-staple'
        )

        permissions = Permission.objects.filter(
            content_type__app_label='projects',
            codename__in=Project.PERMISSIONS
        ).exclude(
            content_type__model='board'
        ).exclude(
            codename__contains='delete'
        ).values_list('pk', flat=True)

        board_permissions = Permission.objects.filter(
            content_type__app_label='kanban',
            codename__in=Board.PERMISSIONS
        ).values_list('pk', flat=True)

        data = {
            'first_name': 'Jo',
            'last_name': 'Bloggs',
            'email': 'jo@example.com',
            'permissions': permissions,
            'board_%d_permissions' % Board.objects.get().pk: board_permissions
        }

        response = self.client.post(
            '/projects/5e33ed6882a00/managers/1/',
            data
        )

        if response.context and 'form' in response.context:
            form = response.context['form']
            for field, errors in form.errors.items():
                for error in errors:
                    self.fail(
                        '%s: %s' % (field, error)
                    )

        user = User.objects.get()
        project = Project.objects.get()

        self.assertTrue(project.user_has_perm(user, 'change_project'))
        self.assertFalse(project.user_has_perm(user, 'delete_project'))

        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response['Location'],
            '/projects/5e33ed6882a00/managers/'
        )

    def test_post_authenticated_duplicate_email(self):
        self.client.login(
            email='jo@example.com',
            password='correct-horse-battery-staple'
        )

        User.objects.create_user(
            'alex',
            'alex@example.com',
            'correct-horse-battery-staple'
        )

        permissions = Permission.objects.filter(
            content_type__app_label='projects',
            codename__in=Project.PERMISSIONS
        ).exclude(
            content_type__model='board'
        ).exclude(
            codename__contains='delete'
        ).values_list('pk', flat=True)

        data = {
            'first_name': 'Jo',
            'last_name': 'Bloggs',
            'email': 'alex@example.com',
            'permissions': permissions
        }

        response = self.client.post(
            '/projects/5e33ed6882a00/managers/1/',
            data
        )

        self.assertEqual(response.status_code, 200)
        form = response.context['form']
        self.assertEqual(
            form.errors['email'][0],
            'Another user is already using this email address.'
        )
