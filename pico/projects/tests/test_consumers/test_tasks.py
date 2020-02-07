from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async as d
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


@pytest.fixture()
def project_no_task_permission(scope='function'):
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

        for manager in project.managers.all():
            for perm in manager.permissions.filter(
                codename__in=(
                    'add_task',
                    'change_task',
                    'delete_task'
                )
            ):
                manager.permissions.remove(perm)

    return project


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_invalid_method(project):
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
                    'method': 'post'
                },
                'data': {
                    'type': 'foo'
                }
            }
        )
    )

    response = await communicator.receive_from()
    json_response = json.loads(response)
    assert json_response['error'] == 'Invalid method: post.'


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
                    'method': 'list'
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
async def test_list_tasks(project):
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
                    'type': 'tasks'
                }
            }
        )
    )

    response = await communicator.receive_from()
    json_response = json.loads(response)
    assert any(json_response['data'])


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_update_invalid_content_type(project):
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
async def test_update_tasks_completed(project):
    def g():
        return project.deliverables.first().tasks.first().pk

    task_id = await d(g)()

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
                    'type': 'tasks',
                    'id': task_id,
                    'attributes': {
                        'completed': True
                    }
                }
            }
        )
    )

    response = await communicator.receive_from()
    json_response = json.loads(response)
    assert json_response['meta']['method'] == 'update'
    assert json_response['data']['id'] == task_id
    assert json_response['data']['attributes']['completed'] is True


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_update_tasks_incompleted(project):
    def g():
        return project.deliverables.first().tasks.first().pk

    task_id = await d(g)()

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
                    'type': 'tasks',
                    'id': task_id,
                    'attributes': {
                        'completed': False
                    }
                }
            }
        )
    )

    response = await communicator.receive_from()
    json_response = json.loads(response)
    assert json_response['meta']['method'] == 'update'
    assert json_response['data']['id'] == task_id
    assert json_response['data']['attributes']['completed'] is False
