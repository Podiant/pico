from channels.generic.websocket import WebsocketConsumer
from .models import Board
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
        if text_data == 'get':
            self.send(
                text_data=json.dumps(
                    {
                        'columns': [
                            {
                                'id': column.pk,
                                'name': column.name
                            }
                            for column in self.board.columns.all()
                        ]
                    }
                )
            )
