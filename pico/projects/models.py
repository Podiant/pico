from django.contrib.auth.models import Permission
from django.db import models, transaction
from django.dispatch import receiver
from django.urls import reverse
from django.utils.translation import gettext as _
from pico.kanban.models import Board as BoardBase, Card as CardBase
from pico.onboarding.signals import user_onboarded
from . import helpers, permissions
from .managers import ProjectManager, BoardManager


class Project(models.Model):
    name = models.CharField(max_length=100)
    slug = models.CharField(max_length=16, unique=True)
    creator = models.ForeignKey(
        'auth.User',
        related_name='created_projects',
        null=True,
        on_delete=models.SET_NULL
    )

    artwork = models.ImageField(
        max_length=100,
        upload_to=helpers.upload_project_image,
        null=True,
        blank=True
    )

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True, null=True, blank=True)

    PERMISSIONS = (
        permissions.CHANGE_PROJECT,
        permissions.DELETE_PROJECT,
        permissions.CREATE_BOARD
    )

    BOARD_COLUMNS = [
        'Planning',
        'Recorded',
        'Edited',
        'Uploaded',
        'Published'
    ]

    objects = ProjectManager()

    def __str__(self):
        return self.name

    def natural_key(self):  # pragma: no cover
        return self.slug

    def get_absolute_url(self):
        return reverse('project_detail', args=[self.slug])

    @transaction.atomic()
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = helpers.uniqid()

        new = not self.pk
        super().save(*args, **kwargs)

        if new:
            manager = self.managers.create(user=self.creator)

            for (codename) in self.PERMISSIONS:
                djp = Permission.objects.get(
                    content_type__app_label='projects',
                    codename=codename
                )

                manager.permissions.add(djp)

            board = self.boards.create(
                name=_('Episodes'),
                slug='episodes',
                default=True,
                creator=self.creator
            )

            for i, column in enumerate(self.BOARD_COLUMNS):
                board.columns.create(
                    name=_(column),
                    ordering=i * 10
                )

    def user_has_perm(self, user, *permissions):
        user_permissions = list(
            Permission.objects.filter(
                projects__user=user,
                projects__project=self,
                content_type__app_label='projects',
                codename__in=permissions
            ).values_list(
                'codename',
                flat=True
            ).order_by(
                'codename'
            )
        )

        for p in permissions:
            if p not in user_permissions:
                return False

        return any(user_permissions)

    class Meta:
        ordering = ('-updated',)
        get_latest_by = 'created'


class DirectoryListing(models.Model):
    project = models.ForeignKey(
        Project,
        related_name='directory_listings',
        on_delete=models.CASCADE
    )

    directory = models.CharField(
        max_length=10,
        choices=(
            ('apple', 'Apple Podcasts'),
            ('deezer', 'Deezer'),
            ('google', 'Google Podcasts'),
            ('spotify', 'Spotify'),
            ('stitcher', 'Stitcher'),
            ('tunein', 'TuneIn')
        )
    )

    url = models.URLField('URL', max_length=512)

    def __str__(self):
        return self.directory

    class Meta:
        unique_together = ('directory', 'project')
        ordering = ('directory', 'project__name')


class Manager(models.Model):
    project = models.ForeignKey(
        Project,
        related_name='managers',
        on_delete=models.CASCADE
    )

    user = models.ForeignKey(
        'auth.User',
        related_name='project_management_roles',
        on_delete=models.CASCADE
    )

    permissions = models.ManyToManyField(
        Permission,
        related_name='projects'
    )

    class Meta:
        unique_together = ('user', 'project')
        ordering = (
            'user__last_name',
            'user__first_name',
            'user__email',
            'project__name'
        )


@receiver(user_onboarded)
def provision_user(sender, user, **kwargs):
    permission = Permission.objects.get(
        content_type__app_label='projects',
        content_type__model='project',
        codename='add_project'
    )

    user.user_permissions.add(permission)


class Deliverable(models.Model):
    project = models.ForeignKey(
        Project,
        related_name='deliverables',
        on_delete=models.CASCADE
    )

    name = models.CharField(max_length=255)
    slug = models.CharField(max_length=16)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True, null=True, blank=True)
    due = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = helpers.uniqid()

        super().save(*args, **kwargs)

    class Meta:
        ordering = ('-updated',)
        get_latest_by = 'created'
        unique_together = ('slug', 'project')


class Board(BoardBase):
    project = models.ForeignKey(
        Project,
        related_name='boards',
        on_delete=models.CASCADE
    )

    slug = models.SlugField(max_length=100)
    default = models.BooleanField(default=False)
    objects = BoardManager()

    def get_absolute_url(self):
        return reverse(
            'board_detail',
            args=[
                self.project.slug,
                self.slug
            ]
        )

    def natural_key(self):
        return [self.project.slug, self.slug]

    class Meta:
        ordering = ('-default', 'name')
        unique_together = ('slug', 'project')


class Card(CardBase):
    deliverable = models.OneToOneField(
        Deliverable,
        on_delete=models.CASCADE
    )

    def __str__(self):
        return str(self.deliverable)
