from channels.testing import WebsocketCommunicator
from django.contrib.auth.models import User
from django.db import transaction
from ..consumers import EmailUniquenessConsumer, PasswordValidationConsumer
import json
import pytest


@pytest.mark.asyncio
@pytest.mark.django_db()
async def test_email_uniqueness_consumer_unique():
    communicator = WebsocketCommunicator(
        EmailUniquenessConsumer,
        '/ws/unique/email'
    )

    connected, subprotocol = await communicator.connect()

    assert connected
    await communicator.send_to('jo@example.com')

    response = await communicator.receive_from()
    json_response = json.loads(response)
    assert json_response['valid']


@pytest.fixture()
def user(scope='function'):
    with transaction.atomic():
        user = User.objects.create_user(
            'jo',
            'jo@example.com',
            'correct-horse-battery-staple'
        )

    return user


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_email_uniqueness_consumer_taken(user):
    communicator = WebsocketCommunicator(
        EmailUniquenessConsumer,
        '/ws/unique/email'
    )

    connected, subprotocol = await communicator.connect()

    assert connected
    await communicator.send_to('jo@example.com')

    response = await communicator.receive_from()
    json_response = json.loads(response)
    assert json_response['error'] == 'This email address is already in use.'


@pytest.mark.asyncio
async def test_password_validation_consumer_invalid():
    communicator = WebsocketCommunicator(
        PasswordValidationConsumer,
        '/ws/validate/password'
    )

    connected, subprotocol = await communicator.connect()

    assert connected
    await communicator.send_to('password')

    response = await communicator.receive_from()
    json_response = json.loads(response)
    assert json_response['error'] == 'This password is too common.'


@pytest.mark.asyncio
async def test_password_validation_consumer_valid():
    communicator = WebsocketCommunicator(
        PasswordValidationConsumer,
        '/ws/validate/password'
    )

    connected, subprotocol = await communicator.connect()

    assert connected
    await communicator.send_to('d*3Ew4Zu3dhRe*fVZDr@p2*r')

    response = await communicator.receive_from()
    json_response = json.loads(response)
    assert json_response['valid']
