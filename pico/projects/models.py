from asgiref.sync import async_to_sync as s
from channels.layers import get_channel_layer
from django.contrib.auth.models import Permission
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.core.files import File
from django.db import models, transaction
from django.dispatch import receiver
from django.urls import reverse
from django.utils import timezone
from django.utils.translation import gettext as _
from mimetypes import guess_type
from pico import dateparser
from pico.kanban.models import Board as BoardBase, Card as CardBase
from pico.onboarding.signals import user_onboarded
from tempfile import mkstemp
from zipfile import ZipFile
from . import helpers, permissions
from .managers import ProjectManager, BoardManager
import json
import os


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
        permissions.DELETE_DELIVERABLE,
        permissions.ADD_TASK,
        permissions.CHANGE_TASK,
        permissions.DELETE_TASK,
        permissions.ADD_EVIDENCE,
        permissions.CHANGE_EVIDENCE,
        permissions.DELETE_EVIDENCE
    )

    EVIDENCE_CATEGORIES = [
        (
            'Assets',
            ('media',),
            (
                'Assets may include series or episode artwork, '
                'marketing materials or pieces of music or speech '
                'that should be included with each episode.'
            )
        ),
        (
            'Recordings',
            ('media', 'pre', 'production')
        ),
        (
            'Master',
            ('media', 'post', 'production')
        ),
        (
            'Notes',
            ('text', 'production')
        )
    ]

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
                    'manager_tags': ('producer',),
                    'evidence_direction': 'up',
                    'evidence_tags': ('text', 'production')
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
                    'title': 'Upload recording',
                    'manager_tags': ('talent', 'producer'),
                    'evidence_direction': 'up',
                    'evidence_tags': ('media', 'pre', 'production')
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
                    'manager_tags': ('editor',),
                    'evidence_direction': 'down',
                    'evidence_tags': ('media', 'pre', 'production')
                },
                {
                    'title': 'Edit episode',
                    'manager_tags': ('editor',)
                },
                {
                    'title': 'Upload draft',
                    'manager_tags': ('editor',),
                    'evidence_direction': 'up',
                    'evidence_tags': ('media', 'post', 'production')
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
                    'manager_tags': ('producer',),
                    'evidence_direction': 'down',
                    'evidence_tags': ('media', 'post', 'production')
                },
                {
                    'title': 'Provide editing notes',
                    'manager_tags': ('producer',),
                    'due_delta': '1 day',
                    'evidence_direction': 'up',
                    'evidence_tags': ('text', 'production')
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
                    'title': 'Upload final master',
                    'manager_tags': ('editor', 'producer'),
                    'due_delta': 'now',
                    'evidence_direction': 'up',
                    'evidence_tags': ('media', 'post', 'production')
                },
                {
                    'title': 'Write episode notes',
                    'manager_tags': ('editor', 'producer'),
                    'due_delta': 'now'
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
                    evidence_tags = task.pop('evidence_tags', ())

                    task_obj = TaskTemplate(
                        stage=stage,
                        title=task_title,
                        **task
                    )

                    task_obj.full_clean()
                    task_obj.save()

                    for tag in manager_tags:
                        task_obj.tags.create(tag=tag)

                    for tag in evidence_tags:
                        task_obj.evidence_tags.create(tag=tag)

            for i, pair in enumerate(self.EVIDENCE_CATEGORIES):
                if len(pair) == 2:
                    name, tags = pair
                    description = None
                elif len(pair) == 3:
                    name, tags, description = pair

                category = self.evidence_categories.create(
                    name=_(name),
                    ordering=i,
                    description=description and _(description) or None
                )

                for tag in tags:
                    category.tags.create(tag=tag)

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
    evidence_direction = models.CharField(
        max_length=4,
        choices=(
            ('up', _('up')),
            ('down', _('down'))
        ),
        null=True,
        blank=True
    )

    def clean(self):
        if self.start_delta:
            try:
                dateparser.parse(self.start_delta)
            except dateparser.ParseError as ex:
                raise ValidationError('Start delta is invalid.') from ex

        if self.due_delta:
            try:
                dateparser.parse(self.due_delta)
            except dateparser.ParseError as ex:
                raise ValidationError('End delta is invalid.') from ex

    def __str__(self):
        return self.title

    @transaction.atomic()
    def create_task(self, deliverable):
        task = Task(
            deliverable=deliverable,
            stage=self.stage,
            title=self.title,
            ordering=self.ordering,
            description=self.description,
            evidence_direction=self.evidence_direction
        )

        if deliverable.due:
            if self.start_delta:
                task.start_date = deliverable.due - dateparser.parse(
                    self.start_delta
                )

            if self.due_delta:
                task.due_date = deliverable.due - dateparser.parse(
                    self.due_delta
                )

        task.save()

        for tag in self.tags.all():
            task.tags.create(tag=tag.tag)

        for tag in self.evidence_tags.all():
            task.evidence_tags.create(tag=tag.tag)

        return task

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

    class Meta:
        unique_together = ('tag', 'template')


class TaskTemplateEvidenceTag(models.Model):
    template = models.ForeignKey(
        TaskTemplate,
        related_name='evidence_tags',
        on_delete=models.CASCADE
    )

    tag = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        unique_together = ('tag', 'template')


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

    def available_tasks(self, manager):
        manager_tags = manager.tags.values_list('tag', flat=True)
        tasks = Task.objects.filter(
            deliverable=self,
            tags__tag__in=manager_tags
        ).exclude(
            evidence_direction='down'
        )

        if self.stage:
            tasks = tasks.filter(
                stage=self.stage
            )

        return tasks.distinct()

    @transaction.atomic()
    def save(self, *args, **kwargs):
        def _send():
            from .serialisers import deliverable as serialise

            msg = {
                'meta': {
                    'method': new and 'create' or 'update',
                    'type': 'deliverables'
                },
                'data': serialise(self)
            }

            channel_layer = get_channel_layer()
            s(channel_layer.group_send)(
                'deliverables.%s.%s' % tuple(self.natural_key()),
                {
                    'type': 'group.message',
                    'data': msg
                }
            )

        if not self.slug:
            self.slug = helpers.uniqid()

        new = not self.pk
        transaction.on_commit(_send)
        super().save(*args, **kwargs)

        if new:
            for template in TaskTemplate.objects.filter(
                stage__project=self.project
            ):
                template.create_task(self)

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

    def natural_key(self):
        return (self.project.slug, self.slug)

    @transaction.atomic()
    def advance(self):
        if self.stage:
            next_stage = self.project.stages.filter(
                ordering__gt=self.stage.ordering
            ).first()

            if next_stage:
                self.stage = next_stage
                self.save(update_fields=('stage',))

                if self.stage.board_column:
                    try:
                        self.card.column = self.stage.board_column
                        self.card.save(update_fields=('column',))
                    except Deliverable.card.RelatedObjectDoesNotExist:
                        pass

    class Meta:
        ordering = ('-updated',)
        get_latest_by = 'created'
        unique_together = ('slug', 'project')


class Task(models.Model):
    deliverable = models.ForeignKey(
        Deliverable,
        related_name='tasks',
        on_delete=models.CASCADE
    )

    stage = models.ForeignKey(
        Stage,
        related_name='tasks',
        on_delete=models.CASCADE
    )

    title = models.CharField(max_length=100)
    start_date = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    completion_date = models.DateTimeField(null=True, blank=True)
    ordering = models.PositiveIntegerField(default=0)
    description = models.TextField(null=True, blank=True)
    evidence_direction = models.CharField(
        max_length=4,
        choices=(
            ('up', _('up')),
            ('down', _('down'))
        ),
        null=True,
        blank=True
    )

    def __str__(self):
        return self.title

    @property
    def evidence_categories(self):
        tags = self.evidence_tags.values_list(
            'tag',
            flat=True
        ).distinct()

        query = EvidenceCategory.objects.all()

        for tag in tags:
            query = query.filter(tags__tag=tag)

        return query.distinct()

    @transaction.atomic()
    def save(self, *args, **kwargs):
        def _send():
            from .serialisers import task as serialise

            msg = {
                'meta': {
                    'method': new and 'create' or 'update',
                    'type': 'tasks'
                },
                'data': serialise(self)
            }

            channel_layer = get_channel_layer()
            s(channel_layer.group_send)(
                'deliverables.%s.%s' % tuple(self.deliverable.natural_key()),
                {
                    'type': 'group.message',
                    'data': msg
                }
            )

        new = not self.pk
        transaction.on_commit(_send)
        super().save(*args, **kwargs)

        if self.completion_date:
            incomplete_tasks = self.stage.tasks.filter(
                deliverable=self.deliverable,
                completion_date__isnull=True
            )

            if not incomplete_tasks.exists():
                self.deliverable.advance()

    def submit_evidence(self, user, category, notes='', media=[]):
        category = self.deliverable.project.evidence_categories.get(
            pk=category
        )

        if len(media) > 1:
            mime_type = 'application/zip'
        elif len(media) == 1:
            mime_type, encoding = guess_type(media[0]['name'])
        else:
            mime_type = 'text/plain'

        piece = EvidencePiece(
            deliverable=self.deliverable,
            category=category,
            notes=notes,
            mime_type=mime_type,
            creator=user
        )

        cleanup = []

        if len(media) == 1:
            filename = cache.get('files.%s' % media[0]['id'])
            if not filename:
                raise ValidationError('File has expired.')

            if not os.path.exists(filename):
                raise ValidationError('File has disappeared.')

            piece.name = media[0]['name']
            with open(filename, 'rb') as f:
                piece.media = File(f)
                piece.full_clean()
                piece.save()

            cleanup.append(filename)
        elif any(media):
            handle, zip_filename = mkstemp('.zip')
            os.close(handle)

            try:
                archive = ZipFile(zip_filename, 'w')

                for i, m in enumerate(media):
                    filename = cache.get('files.%s' % m['id'])
                    if not filename:
                        raise ValidationError(
                            'File %d has expired.' % (i + 1)
                        )

                    if not os.path.exists(filename):
                        raise ValidationError(
                            'File %d has disappeared.' % (i + 1)
                        )

                    archive.write(filename, m['name'])
                    cleanup.append(filename)
            finally:
                archive.close()

            piece.name = '%s.zip' % piece.category.name
            with open(zip_filename, 'rb') as f:
                piece.media = File(f)
                piece.full_clean()
                piece.save()
                cleanup.append(zip_filename)
        else:
            piece.name = _('Notes')
            piece.full_clean()
            piece.save()

        def do_cleanup():
            while any(cleanup):
                filename = cleanup.pop()
                if os.path.exists(filename):
                    os.remove(filename)

        transaction.on_commit(do_cleanup)
        self.completion_date = timezone.now()
        self.save()

        return piece

    class Meta:
        ordering = ('ordering',)


class TaskTag(models.Model):
    task = models.ForeignKey(
        Task,
        related_name='tags',
        on_delete=models.CASCADE
    )

    tag = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        unique_together = ('tag', 'task')


class TaskEvidenceTag(models.Model):
    task = models.ForeignKey(
        Task,
        related_name='evidence_tags',
        on_delete=models.CASCADE
    )

    tag = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        unique_together = ('tag', 'task')


class EvidenceCategory(models.Model):
    project = models.ForeignKey(
        Project,
        related_name='evidence_categories',
        on_delete=models.CASCADE
    )

    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    ordering = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ('ordering',)


class EvidenceCategoryTag(models.Model):
    category = models.ForeignKey(
        EvidenceCategory,
        related_name='tags',
        on_delete=models.CASCADE
    )

    tag = models.CharField(max_length=100)

    def __str__(self):
        return self.tag

    class Meta:
        unique_together = ('tag', 'category')


class EvidencePiece(models.Model):
    deliverable = models.ForeignKey(
        Deliverable,
        related_name='evidence',
        on_delete=models.CASCADE
    )

    category = models.ForeignKey(
        EvidenceCategory,
        related_name='pieces',
        null=True,
        on_delete=models.SET_NULL
    )

    name = models.CharField(max_length=100)
    notes = models.TextField(null=True, blank=True)
    mime_type = models.CharField(max_length=100)
    media = models.FileField(
        max_length=255,
        upload_to=helpers.upload_evidence,
        null=True,
        blank=True
    )

    creator = models.ForeignKey(
        'auth.User',
        related_name='evidence',
        null=True,
        on_delete=models.SET_NULL
    )

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True, null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ('-created',)
        get_latest_by = 'created'


class EvidenceTag(models.Model):
    piece = models.ForeignKey(
        EvidencePiece,
        related_name='tags',
        on_delete=models.CASCADE
    )

    tag = models.CharField(max_length=100)

    def __str__(self):
        return self.tag

    class Meta:
        unique_together = ('tag', 'piece')


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
