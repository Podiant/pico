from channels.auth import AuthMiddlewareStack
from channels.testing import WebsocketCommunicator
from django.contrib.auth.models import User
from django.db import transaction
from ...consumers import DeliverableConsumer
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

        project.deliverables.create(
            name='Episode one',
            slug='5e3ac11d11bc5'
        )

    return project


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_invalid_content_type(project):
    communicator = WebsocketCommunicator(
        AuthMiddlewareStack(DeliverableConsumer),
        '/ws/projects/5e33ed6882a00/deliverables/5e3ac11d11bc5/'
    )

    communicator.scope['user'] = project.creator
    communicator.scope['url_route'] = {
        'kwargs': {
            'project__slug': '5e33ed6882a00',
            'slug': '5e3ac11d11bc5'
        }
    }

    connected, subprotocol = await communicator.connect()

    assert connected
    await communicator.send_to(
        json.dumps(
            {
                'meta': {
                    'method': 'get'
                },
                'data': {
                    'type': 'foo'
                }
            }
        )
    )

    response = await communicator.receive_from()
    json_response = json.loads(response)
    assert json_response['error'] == 'Invalid content type: foo.'


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_get_deliverables(project):
    communicator = WebsocketCommunicator(
        AuthMiddlewareStack(DeliverableConsumer),
        '/ws/projects/5e33ed6882a00/deliverables/5e3ac11d11bc5/'
    )

    communicator.scope['user'] = project.creator
    communicator.scope['url_route'] = {
        'kwargs': {
            'project__slug': '5e33ed6882a00',
            'slug': '5e3ac11d11bc5'
        }
    }

    connected, subprotocol = await communicator.connect()

    assert connected
    await communicator.send_to(
        json.dumps(
            {
                'meta': {
                    'method': 'get'
                },
                'data': {
                    'type': 'deliverables'
                }
            }
        )
    )

    response = await communicator.receive_from()
    json_response = json.loads(response)
    assert json_response['data']['attributes']['name'] == 'Episode one'
