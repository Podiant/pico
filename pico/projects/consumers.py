from channels.generic.websocket import WebsocketConsumer
from django.core.exceptions import PermissionDenied, ValidationError
from django.db import transaction
from django.utils import timezone
from django.utils.translation import gettext as _
from . import helpers, serialisers
from .models import Board, Deliverable, Card
import json


class ContentTypeError(Exception):
    pass


class APIConsumerMixin(object):
    def invalid_content_type(self, type):
        raise ContentTypeError(
            _(
                'Invalid content type: %s.' % (
                    type or '(none)'
                )
            )
        )

    def method_not_allowed(self, method):
        return {
            'error': _(
                'Invalid method: %s.' % (
                    method or '(none)'
                )
            )
        }

    def list(self, type=None, **kwargs):
        if type and hasattr(self, 'list_%s' % type):
            return getattr(self, 'list_%s' % type)(**kwargs)

        self.invalid_content_type(type)

    def create(self, type=None, **kwargs):
        if type and hasattr(self, 'create_%s' % type):
            return getattr(self, 'create_%s' % type)(
                **kwargs.get('attributes', {})
            )

        self.invalid_content_type(type)

    def update(self, type=None, **kwargs):
        if type and hasattr(self, 'update_%s' % type):
            return getattr(self, 'update_%s' % type)(
                id=kwargs['id'],
                **kwargs.get('attributes', {})
            )

        self.invalid_content_type(type)

    def delete(self, type=None, **kwargs):
        if type and hasattr(self, 'delete_%s' % type):
            return getattr(self, 'delete_%s' % type)(**kwargs)

        self.invalid_content_type(type)

    def dispatch_request(self, method, data, meta):
        func = getattr(self, method, None)

        if func:
            try:
                reuslt = func(**data)
            except PermissionDenied:
                self.send(
                    text_data=json.dumps(
                        {
                            'error': _('Permission denied.')
                        }
                    )
                )
            except ContentTypeError as ex:
                self.send(
                    text_data=json.dumps(
                        {
                            'error': ex.args[0]
                        }
                    )
                )
            except ValidationError as ex:
                self.send(
                    text_data=json.dumps(
                        {
                            'error': _('Validation error.'),
                            'detail': [
                                str(a) for a in ex.args
                            ]
                        }
                    )
                )

            self.send(
                text_data=json.dumps(reuslt)
            )

            return

        self.send(
            text_data=json.dumps(
                self.method_not_allowed(method)
            )
        )

    def receive(self, text_data):
        json_request = json.loads(text_data)
        meta = json_request['meta']
        method = meta.pop('method', None)
        data = json_request.get('data')
        self.dispatch_request(method, data, meta)


class BoardConsumer(APIConsumerMixin, WebsocketConsumer):
    def connect(self):
        self.board = self.get_object()
        self.accept()

    def get_object(self):
        kwargs = self.scope['url_route']['kwargs']

        return Board.objects.get(
            project__slug=kwargs['project__slug'],
            slug=kwargs['slug'],
            managers__user=self.scope['user'],
            managers__permissions__content_type__app_label='kanban',
            managers__permissions__codename='change_board'
        )

    def dispatch_request(self, method, data, meta):
        if method == 'update_list':
            self.send(
                text_data=json.dumps(
                    self.update_list(
                        meta['type'],
                        *data
                    )
                )
            )

            return

        super().dispatch_request(method, data, meta)

    def list_columns(self):
        manager = self.board.managers.get(
            user=self.scope['user']
        )

        data = [
            serialisers.column(
                column,
                manager=manager
            ) for column in self.board.columns.all()
        ]

        return {
            'meta': {
                'method': 'list',
                'type': 'columns'
            },
            'data': data
        }

    def create_cards(self, **kwargs):
        manager = self.board.managers.get(
            user=self.scope['user']
        )

        column = kwargs.pop('column')

        if not self.board.user_has_perm(
            self.scope['user'],
            'add_card'
        ):
            raise PermissionDenied()

        column = self.board.columns.get(pk=column)
        stage = self.board.project.stages.filter(
            board_column=column
        ).first()

        with transaction.atomic():
            obj = Deliverable(
                slug=helpers.uniqid(),
                stage=stage,
                **kwargs
            )

            obj.project = self.board.project
            obj.full_clean()
            obj.save()

            card = obj.to_card(self.board, column)

            card.full_clean()
            card.save()

        return {
            'meta': {
                'method': 'create',
                'type': 'cards'
            },
            'data': serialisers.card(
                card,
                manager=manager
            )
        }

    def update_cards(self, id, **kwargs):
        manager = self.board.managers.get(
            user=self.scope['user']
        )

        if not self.board.user_has_perm(
            self.scope['user'],
            'change_card'
        ):
            raise PermissionDenied()

        card = Card.objects.get(pk=id)
        column_id = kwargs.get('column', None)
        name = kwargs.get('name')
        ordering = kwargs.get('ordering')
        update_fields = []

        with transaction.atomic():
            if column_id:
                card.column = self.board.columns.get(
                    pk=column_id
                )

                stage = self.board.project.stages.filter(
                    board_column=card.column
                ).first()

                card.deliverable.stage = stage
                card.deliverable.save()
                update_fields.append('column')

            if ordering is not None:
                card.ordering = ordering
                update_fields.append('ordering')

            card.full_clean()
            card.save(
                update_fields=tuple(update_fields)
            )

            if name:
                card.deliverable.name = name
                card.deliverable.full_clean()
                card.deliverable.save()

        return {
            'meta': {
                'method': 'update',
                'type': 'cards'
            },
            'data': serialisers.card(
                card,
                manager=manager
            )
        }

    @transaction.atomic()
    def update_list(self, type, *items):
        returns = []

        for item in items:
            returns.append(
                self.update_cards(
                    id=item['id'],
                    **item.get('attributes', {})
                )['data']
            )

        return {
            'meta': {
                'method': 'update_list',
                'type': type
            },
            'data': returns
        }

    def delete_cards(self, id):
        if not self.board.user_has_perm(
            self.scope['user'],
            'delete_card'
        ):
            raise PermissionDenied()

        card = Card.objects.get(pk=id)
        column = card.column
        card.deliverable.delete()
        card.delete()

        for i, other in enumerate(
            column.cards.order_by('ordering')
        ):
            other.ordering = i
            other.save(
                update_fields=('ordering',)
            )

        return {
            'meta': {
                'method': 'delete',
                'type': 'cards'
            },
            'data': {
                'id': id
            }
        }


class TasksConsumer(APIConsumerMixin, WebsocketConsumer):
    def connect(self):
        self.deliverable = self.get_object()
        self.accept()

    def get_object(self):
        kwargs = self.scope['url_route']['kwargs']

        return Deliverable.objects.filter(
            project__slug=kwargs['project__slug'],
            slug=kwargs['slug'],
            project__managers__user=self.scope['user'],
            project__managers__permissions__content_type__app_label='projects',
            project__managers__permissions__content_type__model='task'
        ).distinct().get()

    def list_tasks(self):
        manager = self.deliverable.project.managers.get(
            user=self.scope['user']
        )

        data = [
            serialisers.task(task)
            for task in self.deliverable.available_tasks(
                manager
            ).prefetch_related(
                'tags',
                'evidence_tags'
            )
        ]

        return {
            'meta': {
                'method': 'list',
                'type': 'tasks'
            },
            'data': data
        }

    def update_tasks(self, id, **kwargs):
        task = self.deliverable.tasks.get(pk=id)

        if kwargs.get('completed'):
            task.completion_date = timezone.now()
        elif 'completed' in kwargs:
            task.completion_date = None

        task.full_clean()
        task.save()

        return {
            'meta': {
                'method': 'update',
                'type': 'tasks'
            },
            'data': serialisers.task(task)
        }
