from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
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


class PasswordValidationConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def receive(self, text_data):
        try:
            validate_password(text_data)
        except ValidationError as ex:
            self.send(
                text_data=json.dumps(
                    {
                        'error': ex.args[0][0].args[0]
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
