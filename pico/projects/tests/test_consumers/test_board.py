from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async as d
from channels.testing import WebsocketCommunicator
from django.contrib.auth.models import User
from django.db import transaction
from ...consumers import BoardConsumer
from ...models import Project, Card
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

        column = project.boards.first().columns.first()
        Card.objects.create(
            board=column.board,
            column=column,
            deliverable=project.deliverables.create(
                name='Episode one'
            )
        )

    return project


@pytest.fixture()
def project_no_card_permission(scope='function'):
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

        for board in project.boards.all():
            for manager in board.managers.all():
                for perm in manager.permissions.filter(
                    codename__in=(
                        'add_card',
                        'change_card',
                        'delete_card'
                    )
                ):
                    manager.permissions.remove(perm)

    return project


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_invalid_method(project):
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
async def test_list_columns(project):
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
    await communicator.send_to(
        json.dumps(
            {
                'meta': {
                    'method': 'list'
                },
                'data': {
                    'type': 'columns'
                }
            }
        )
    )

    response = await communicator.receive_from()
    json_response = json.loads(response)
    assert any(json_response['data'])


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_create_invalid_content_type(project):
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
    await communicator.send_to(
        json.dumps(
            {
                'meta': {
                    'method': 'create'
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
async def test_create_cards_denied(project_no_card_permission):
    def g():
        return project_no_card_permission.boards.first().columns.first().pk

    column_id = await d(g)()

    communicator = WebsocketCommunicator(
        AuthMiddlewareStack(BoardConsumer),
        '/ws/kanban/5e33ed6882a00/episodes/'
    )

    communicator.scope['user'] = project_no_card_permission.creator
    communicator.scope['url_route'] = {
        'kwargs': {
            'project__slug': '5e33ed6882a00',
            'slug': 'episodes'
        }
    }

    connected, subprotocol = await communicator.connect()

    assert connected
    await communicator.send_to(
        json.dumps(
            {
                'meta': {
                    'method': 'create'
                },
                'data': {
                    'type': 'cards',
                    'attributes': {
                        'column': column_id,
                        'name': 'Foo'
                    }
                }
            }
        )
    )

    response = await communicator.receive_from()
    json_response = json.loads(response)
    assert json_response['error'] == 'Permission denied.'


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_create_cards_invalid(project):
    def g():
        return project.boards.first().columns.first().pk

    column_id = await d(g)()

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
    await communicator.send_to(
        json.dumps(
            {
                'meta': {
                    'method': 'create'
                },
                'data': {
                    'type': 'cards',
                    'attributes': {
                        'column': column_id
                    }
                }
            }
        )
    )

    response = await communicator.receive_from()
    json_response = json.loads(response)
    assert json_response['error'] == 'Validation error.'


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_create_cards(project):
    def g():
        return project.boards.first().columns.first().pk

    column_id = await d(g)()

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
    await communicator.send_to(
        json.dumps(
            {
                'meta': {
                    'method': 'create'
                },
                'data': {
                    'type': 'cards',
                    'attributes': {
                        'column': column_id,
                        'name': 'Foo'
                    }
                }
            }
        )
    )

    response = await communicator.receive_from()
    json_response = json.loads(response)
    attrs = json_response['data']['attributes']
    assert attrs['name'] == 'Foo'
    assert attrs['column'] == column_id


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_delete_invalid_content_type(project):
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
    await communicator.send_to(
        json.dumps(
            {
                'meta': {
                    'method': 'delete'
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
async def test_delete_cards_denied(project_no_card_permission):
    communicator = WebsocketCommunicator(
        AuthMiddlewareStack(BoardConsumer),
        '/ws/kanban/5e33ed6882a00/episodes/'
    )

    communicator.scope['user'] = project_no_card_permission.creator
    communicator.scope['url_route'] = {
        'kwargs': {
            'project__slug': '5e33ed6882a00',
            'slug': 'episodes'
        }
    }

    connected, subprotocol = await communicator.connect()

    assert connected
    await communicator.send_to(
        json.dumps(
            {
                'meta': {
                    'method': 'delete'
                },
                'data': {
                    'type': 'cards',
                    'id': 1
                }
            }
        )
    )

    response = await communicator.receive_from()
    json_response = json.loads(response)
    assert json_response['error'] == 'Permission denied.'


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_delete_cards(project):
    def g():
        return project.boards.first().cards.first().pk

    card_id = await d(g)()

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
    await communicator.send_to(
        json.dumps(
            {
                'meta': {
                    'method': 'delete'
                },
                'data': {
                    'type': 'cards',
                    'id': card_id
                }
            }
        )
    )

    response = await communicator.receive_from()
    json_response = json.loads(response)
    assert json_response['meta']['method'] == 'delete'
    assert json_response['data']['id'] == card_id


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_update_invalid_content_type(project):
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
async def test_update_cards_denied(project_no_card_permission):
    communicator = WebsocketCommunicator(
        AuthMiddlewareStack(BoardConsumer),
        '/ws/kanban/5e33ed6882a00/episodes/'
    )

    communicator.scope['user'] = project_no_card_permission.creator
    communicator.scope['url_route'] = {
        'kwargs': {
            'project__slug': '5e33ed6882a00',
            'slug': 'episodes'
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
                    'type': 'cards',
                    'id': 1
                }
            }
        )
    )

    response = await communicator.receive_from()
    json_response = json.loads(response)
    assert json_response['error'] == 'Permission denied.'


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_update_cards(project):
    def g():
        return project.boards.first().cards.first().pk

    card_id = await d(g)()

    def c():
        return project.boards.first().columns.all()[1].pk

    to_column = await d(c)()

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
    await communicator.send_to(
        json.dumps(
            {
                'meta': {
                    'method': 'update'
                },
                'data': {
                    'type': 'cards',
                    'id': card_id,
                    'attributes': {
                        'column': to_column,
                        'name': 'Updated card'
                    }
                }
            }
        )
    )

    response = await communicator.receive_from()
    json_response = json.loads(response)
    assert json_response['meta']['method'] == 'update'
    assert json_response['data']['id'] == card_id
    assert json_response['data']['attributes']['column'] == to_column
    assert json_response['data']['attributes']['name'] == 'Updated card'


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_update_list_cards(project):
    def g():
        return project.boards.first().cards.first().pk

    card_id = await d(g)()

    def c():
        return project.boards.first().columns.all()[1].pk

    to_column = await d(c)()

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
    await communicator.send_to(
        json.dumps(
            {
                'meta': {
                    'method': 'update_list',
                    'type': 'cards'
                },
                'data': [
                    {
                        'type': 'cards',
                        'id': card_id,
                        'attributes': {
                            'ordering': 10
                        }
                    }
                ]
            }
        )
    )

    response = await communicator.receive_from()
    json_response = json.loads(response)
    assert json_response['meta']['method'] == 'update_list'
    assert json_response['data'][0]['id'] == card_id
