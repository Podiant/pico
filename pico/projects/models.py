from django.contrib.auth.models import Permission
from django.db import models, transaction
from django.dispatch import receiver
from django.urls import reverse
from django.utils.translation import gettext as _
from pico.kanban.models import Board as BoardBase, Card as CardBase
from pico.onboarding.signals import user_onboarded
from . import helpers, permissions
from .managers import ProjectManager, BoardManager
import json


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
                'colour': '6610f2'
            },
            {
                'can_create_cards': ('producer',),
                'can_move_in': ('producer', 'editor'),
                'can_move_out': ('producer',)
            },
            [
                {
                    'title': 'Find a recording date',
                    'manager_tags': ('producer',)
                },
                {
                    'title': 'Prepare notes',
                    'manager_tags': ('producer',)
                }
            ]
        ),
        (
            'Recording',
            {
                'colour': 'dc3545'
            },
            {
                'can_create_cards': ('talenet', 'producer'),
                'can_move_in': ('producer',),
                'can_move_out': ('producer', 'editor',)
            },
            [
                {
                    'title': 'Record episode',
                    'manager_tags': ('talent', 'producer')
                },
                {
                    'title': 'Upload audio',
                    'manager_tags': ('talent', 'producer')
                }
            ]
        ),
        (
            'Editing',
            {
                'colour': 'fd7e14'
            },
            {
                'can_create_cards': ('editor',),
                'can_move_in': ('editor',),
                'can_move_out': ('editor',)
            },
            [
                {
                    'title': 'Download audio',
                    'manager_tags': ('editor',)
                },
                {
                    'title': 'Edit episode',
                    'manager_tags': ('editor',)
                },
                {
                    'title': 'Convert to MP3',
                    'manager_tags': ('editor',)
                }
            ]
        ),
        (
            'Awaiting approval',
            {
                'colour': 'ffc107'
            },
            {
                'can_create_cards': ('producer',),
                'can_move_in': ('editor',),
                'can_move_out': ('producer', 'editor')
            },
            [
                {
                    'title': 'Listen to episode',
                    'manager_tags': ('producer',)
                },
                {
                    'title': 'Provide editing notes',
                    'manager_tags': ('producer',)
                }
            ]
        ),
        (
            'Approved',
            {
                'colour': '28a745'
            },
            {
                'can_create_cards': ('producer', 'editor'),
                'can_move_in': ('producer',),
                'can_move_out': ('producer',)
            },
            [
                {
                    'title': 'Upload audio',
                    'manager_tags': ('editor', 'producer')
                },
                {
                    'title': 'Write episode notes',
                    'manager_tags': ('editor', 'producer')
                }
            ]
        ),
        (
            'Published',
            {
                'colour': '20c997'
            },
            {
                'can_create_cards': ('editor', 'producer',),
                'can_move_in': ('editor', 'producer'),
                'can_move_out': ('editor', 'producer')
            },
            []
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
            for tag in ('talent', 'editor', 'producer'):
                manager.tags.create(tag=tag)

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

            board_manager = board.managers.get(user=self.creator)
            for tag in ('talent', 'editor', 'producer'):
                board_manager.tags.create(tag=tag)

            for i, (
                stage_name,
                stage_kwargs,
                column_kwargs,
                tasks
            ) in enumerate(
                self.STAGES
            ):
                can_create_cards = column_kwargs.get('can_create_cards', [])
                can_move_in = column_kwargs.get('can_move_in', [])
                can_move_out = column_kwargs.get('can_move_out', [])

                column = board.columns.create(
                    name=_(stage_name),
                    ordering=i,
                    can_create_cards=json.dumps(can_create_cards),
                    can_move_in=json.dumps(can_move_in),
                    can_move_out=json.dumps(can_move_out)
                )

                stage = self.stages.create(
                    name=_(stage_name),
                    ordering=i,
                    board_column=column,
                    colour=stage_kwargs.get('colour')
                )

                for task in [dict(**t) for t in tasks]:
                    task_title = _(task.pop('title'))
                    manager_tags = task.pop('manager_tags')
                    task_obj = stage.task_templates.create(
                        title=task_title,
                        **task
                    )

                    for tag in manager_tags:
                        task_obj.tags.create(tag=tag)

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


class Tag(models.Model):
    manager = models.ForeignKey(
        Manager,
        related_name='tags',
        on_delete=models.CASCADE
    )

    tag = models.CharField(max_length=100, db_index=True)

    def __str__(self):
        return self.name

    class Meta:
        unique_together = ('tag', 'manager')


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


class TaskTemplate(models.Model):
    stage = models.ForeignKey(
        Stage,
        related_name='task_templates',
        on_delete=models.CASCADE
    )

    title = models.CharField(max_length=100)
    start_delta = models.CharField(max_length=100, null=True, blank=True)
    due_delta = models.CharField(max_length=100, null=True, blank=True)
    ordering = models.PositiveIntegerField(default=0)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ('ordering',)


class TaskTemplateTag(models.Model):
    template = models.ForeignKey(
        TaskTemplate,
        related_name='tags',
        on_delete=models.CASCADE
    )

    tag = models.CharField(max_length=100)

    def __str__(self):
        return self.name


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

        card = Card(
            deliverable=self,
            board=board,
            column=column,
            ordering=last_card and (last_card.ordering + 1) or 0
        )

        return card

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
