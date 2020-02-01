from channels.generic.websocket import WebsocketConsumer
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils.translation import gettext as _
from . import helpers, serialisers
from .models import Board, Deliverable, Card
import json


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

    def receive(self, text_data):
        json_request = json.loads(text_data)
        method = json_request.get('method')

        if method == 'list':
            manager = self.board.managers.get(
                user=self.scope['user']
            )

            kind = json_request.get('type')

            if kind == 'columns':
                data = [
                    serialisers.column(
                        column,
                        manager=manager
                    ) for column in self.board.columns.all()
                ]

                self.send(
                    text_data=json.dumps(
                        {
                            'meta': {
                                'method': 'list',
                                'type': 'columns'
                            },
                            'data': data
                        }
                    )
                )

                return

            self.send(
                text_data=json.dumps(
                    {
                        'error': _(
                            'Invalid content type: %s.' % (
                                kind or '(none)'
                            )
                        )
                    }
                )
            )

            return

        if method == 'create':
            manager = self.board.managers.get(
                user=self.scope['user']
            )

            kind = json_request.get('type')

            if kind == 'cards':
                attributes = json_request.get('attributes', {})
                column = attributes.pop('column')

                if self.board.user_has_perm(
                    self.scope['user'],
                    'add_card'
                ):
                    try:
                        column = self.board.columns.get(pk=column)
                        stage = self.board.project.stages.filter(
                            board_column=column
                        ).first()

                        with transaction.atomic():
                            obj = Deliverable(
                                slug=helpers.uniqid(),
                                stage=stage,
                                **attributes
                            )

                            obj.project = self.board.project
                            obj.full_clean()
                            obj.save()

                            card = obj.to_card(self.board, column)

                            card.full_clean()
                            card.save()
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

                        return

                    self.send(
                        text_data=json.dumps(
                            {
                                'meta': {
                                    'method': 'create',
                                    'type': 'cards'
                                },
                                'data': serialisers.card(
                                    card,
                                    manager=manager
                                )
                            }
                        )
                    )

                    return

                self.send(
                    text_data=json.dumps(
                        {
                            'error': _('Permission denied.')
                        }
                    )
                )

                return

            self.send(
                text_data=json.dumps(
                    {
                        'error': _(
                            'Invalid content type: %s.' % (
                                kind or '(none)'
                            )
                        )
                    }
                )
            )

            return

        if method == 'delete':
            kind = json_request.get('type')

            if kind == 'cards':
                if self.board.user_has_perm(
                    self.scope['user'],
                    'delete_card'
                ):
                    card_id = json_request['id']
                    card = Card.objects.get(pk=card_id)
                    card.deliverable.delete()
                    card.delete()

                    self.send(
                        text_data=json.dumps(
                            {
                                'meta': {
                                    'method': 'delete',
                                    'type': 'cards'
                                },
                                'data': {
                                    'id': card_id
                                }
                            }
                        )
                    )

                    return

                self.send(
                    text_data=json.dumps(
                        {
                            'error': _('Permission denied.')
                        }
                    )
                )

                return

            self.send(
                text_data=json.dumps(
                    {
                        'error': _(
                            'Invalid content type: %s.' % (
                                kind or '(none)'
                            )
                        )
                    }
                )
            )

            return

        self.send(
            text_data=json.dumps(
                {
                    'error': _(
                        'Invalid method: %s.' % (
                            method or '(none)'
                        )
                    )
                }
            )
        )
