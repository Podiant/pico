from channels.auth import AuthMiddlewareStack
from channels.testing import WebsocketCommunicator
from django.contrib.auth.models import User
from django.db import transaction
from ...consumers import BoardConsumer
from ...models import Project
import json
import pytest


@pytest.fixture()
def project(scope='function'):
    with transaction.atomic():
        user = User.objects.create_user(
            'jo',
            'jo@example.com',
            'correct-horse-battery-staple'
        )

        project = Project.objects.create(
            name='The Foo Show',
            slug='5e33ed6882a00',
            creator=user
        )

    return project


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_get_board(project):
    communicator = WebsocketCommunicator(
        AuthMiddlewareStack(BoardConsumer),
        '/ws/kanban/5e33ed6882a00/episodes/'
    )

    communicator.scope['user'] = project.creator
    communicator.scope['url_route'] = {
        'kwargs': {
            'project__slug': '5e33ed6882a00',
            'slug': 'episodes'
        }
    }

    connected, subprotocol = await communicator.connect()

    assert connected
    await communicator.send_to('get')

    response = await communicator.receive_from()
    json_response = json.loads(response)
    assert 'columns' in json_response
