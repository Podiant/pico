from django.contrib.auth.models import User
from channels.generic.websocket import WebsocketConsumer
from django.utils.translation import gettext as _
import json


class EmailUniquenessConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def receive(self, text_data):
        if User.objects.filter(
            email__iexact=text_data
        ).exists():
            self.send(
                text_data=json.dumps(
                    {
                        'error': _(
                            'This email address is already in use.'
                        )
                    }
                )
            )
        else:
            self.send(
                text_data=json.dumps(
                    {
                        'valid': True
                    }
                )
            )
