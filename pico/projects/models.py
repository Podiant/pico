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
        permissions.ADD_BOARD,
        permissions.ADD_DELIVERABLE,
        permissions.CHANGE_DELIVERABLE,
        permissions.DELETE_DELIVERABLE
    )

    STAGES = [
        (
            'Planning',
            {
                'colour': '007bff'
            },
            {
                'can_create_cards': True,
                'can_move_in': True,
                'can_move_out': True
            }
        ),
        (
            'Recorded',
            {
                'colour': 'dc3545'
            },
            {
                'can_create_cards': True,
                'can_move_in': True,
                'can_move_out': True
            }
        ),
        (
            'Edited',
            {
                'colour': 'fd7e14'
            },
            {
                'can_create_cards': False,
                'can_move_in': True,
                'can_move_out': True
            }
        ),
        (
            'Uploaded',
            {
                'colour': 'ffc107'
            },
            {
                'can_create_cards': False,
                'can_move_in': True,
                'can_move_out': True
            }
        ),
        (
            'Published',
            {
                'colour': '28a745'
            },
            {
                'can_create_cards': False,
                'can_move_in': True,
                'can_move_out': True
            }
        )
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

            for i, (stage_name, stage_kwargs, column_kwargs) in enumerate(
                self.STAGES
            ):
                column = board.columns.create(
                    name=_(stage_name),
                    ordering=i,
                    **column_kwargs
                )

                self.stages.create(
                    name=_(stage_name),
                    ordering=i,
                    board_column=column,
                    **stage_kwargs
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


class Stage(models.Model):
    project = models.ForeignKey(
        Project,
        related_name='stages',
        on_delete=models.CASCADE
    )

    name = models.CharField(max_length=100)
    colour = models.CharField(
        max_length=6,
        default='17a2b8',
        choices=(
            ('fff', _('white')),
            ('e9ecef', _('light grey')),
            ('adb5bd', _('grey')),
            ('343a40', _('dark grey')),
            ('000', _('black')),
            ('007bff', _('blue')),
            ('6610f2', _('indigo')),
            ('6f42c1', _('purple')),
            ('e83e8c', _('pink')),
            ('dc3545', _('red')),
            ('fd7e14', _('orange')),
            ('ffc107', _('yellow')),
            ('28a745', _('green')),
            ('20c997', _('teal')),
            ('17a2b8', _('cyan'))
        )
    )

    board_column = models.OneToOneField(
        'kanban.Column',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    ordering = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ('ordering',)


class Deliverable(models.Model):
    project = models.ForeignKey(
        Project,
        related_name='deliverables',
        on_delete=models.CASCADE
    )

    stage = models.ForeignKey(
        Stage,
        related_name='deliverables',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
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

    def to_card(self, board, column):
        last_card = column.cards.last()

        return Card(
            deliverable=self,
            board=board,
            column=column,
            ordering=last_card and (last_card.ordering + 1) or 0
        )

    def get_absolute_url(self):
        return reverse(
            'deliverable_detail',
            args=[
                self.project.slug,
                self.slug
            ]
        )

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

    def get_absolute_url(self):
        return self.deliverable.get_absolute_url()
