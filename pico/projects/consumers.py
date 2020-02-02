from channels.generic.websocket import WebsocketConsumer
from django.core.exceptions import PermissionDenied, ValidationError
from django.db import transaction
from django.utils.translation import gettext as _
from . import helpers, serialisers
from .models import Board, Deliverable, Card
import json


class ContentTypeError(Exception):
    pass


class BoardConsumer(WebsocketConsumer):
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

    def list(self, type=None):
        if type == 'columns':
            return self.list_columns()

        raise ContentTypeError(
            _(
                'Invalid content type: %s.' % (
                    type or '(none)'
                )
            )
        )

    def create_card(self, **kwargs):
        manager = self.board.managers.get(
            user=self.scope['user']
        )

        column = kwargs.pop('column')

        if self.board.user_has_perm(
            self.scope['user'],
            'add_card'
        ):
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

        raise PermissionDenied()

    def create(self, type=None, attributes={}, **kwargs):
        if type == 'cards':
            return self.create_card(**attributes)

        raise ContentTypeError(
            _(
                'Invalid content type: %s.' % (
                    type or '(none)'
                )
            )
        )

    def update_card(self, pk, **kwargs):
        manager = self.board.managers.get(
            user=self.scope['user']
        )

        if self.board.user_has_perm(
            self.scope['user'],
            'change_card'
        ):
            card = Card.objects.get(pk=pk)
            column_id = kwargs.get('column', None)
            name = kwargs.get('name')

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

                    card.full_clean()
                    card.save()

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

        raise PermissionDenied()

    def update(self, type=None, id=None, attributes={}, **kwargs):
        if type == 'cards':
            return self.update_card(id, **attributes)

        raise ContentTypeError(
            _(
                'Invalid content type: %s.' % (
                    type or '(none)'
                )
            )
        )

    @transaction.atomic()
    def update_list(self, type, *items):
        returns = []

        for item in items:
            returns.append(
                self.update(**item)['data']
            )

        return {
            'meta': {
                'method': 'update_list',
                'type': type
            },
            'data': returns
        }

    def delete(self, type=None, id=None):
        if type == 'cards':
            if self.board.user_has_perm(
                self.scope['user'],
                'delete_card'
            ):
                card = Card.objects.get(pk=id)
                card.deliverable.delete()
                card.delete()

                return {
                    'meta': {
                        'method': 'delete',
                        'type': 'cards'
                    },
                    'data': {
                        'id': id
                    }
                }

            raise PermissionDenied()

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

    def receive(self, text_data):
        json_request = json.loads(text_data)
        meta = json_request['meta']
        data = json_request.get('data')
        method = meta.pop('method', None)

        try:
            if method == 'list':
                self.send(
                    text_data=json.dumps(
                        self.list(**data)
                    )
                )
            elif method == 'create':
                self.send(
                    text_data=json.dumps(
                        self.create(**data)
                    )
                )
            elif method == 'update':
                self.send(
                    text_data=json.dumps(
                        self.update(**data)
                    )
                )
            elif method == 'update_list':
                self.send(
                    text_data=json.dumps(
                        self.update_list(
                            meta['type'],
                            *data
                        )
                    )
                )
            elif method == 'delete':
                self.send(
                    text_data=json.dumps(
                        self.delete(**data)
                    )
                )
            else:
                self.send(
                    text_data=json.dumps(
                        self.method_not_allowed(method)
                    )
                )
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
