from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async as d
from channels.testing import WebsocketCommunicator
from datetime import datetime
from django.contrib.auth.models import User
from django.db import transaction
from django.utils.timezone import utc
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

        deliverable = project.deliverables.create(
            name='Episode one',
            slug='5e3ac11d11bc5',
            stage=project.stages.first()
        )

        date = datetime(2020, 1, 1, 0, 0, 0, 0, tzinfo=utc)
        for task in deliverable.tasks.filter(
            stage=project.stages.first()
        ):
            task.completion_date = date
            task.completed_by = user
            task.save()

    return project


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_list_activity(project):
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
                    'method': 'list'
                },
                'data': {
                    'type': 'activity'
                }
            }
        )
    )

    response = await communicator.receive_from()
    json_response = json.loads(response)
    task = json_response['data'][0]['attributes']
    assert 'id' in task['stage']
    assert task['read']


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_update_activity(project):
    def g():
        return project.deliverables.first().activity.posts.first().pk

    post_id = await d(g)()

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
                    'method': 'update'
                },
                'data': {
                    'type': 'activity',
                    'id': post_id,
                    'attributes': {
                        'read': False
                    }
                }
            }
        )
    )

    response = await communicator.receive_from()
    json_response = json.loads(response)
    assert any(json_response['data'])
