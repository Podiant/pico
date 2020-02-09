from hashlib import md5
from ..serialisation import serialiser, include
from ..kanban.models import Column
from .models import Stage, Card, Deliverable, Task, EvidencePiece


@serialiser('stages', Stage)
def stage(obj):
    return {
        'id': obj.pk,
        'attributes': {
            'name': str(obj),
            'index': obj.ordering,
            'colour': '#%s' % (obj.colour or '000000')
        }
    }


@serialiser('columns', Column)
def column(obj, manager=None):
    return {
        'id': obj.pk,
        'type': 'columns',
        'attributes': {
            'name': str(obj),
            'can_create_cards': (
                manager and
                obj.user_can_create_cards(manager) or
                False
            ),
            'can_move_in': (
                manager and
                obj.user_can_move_in(manager) or
                False
            ),
            'can_move_out': (
                manager and
                obj.user_can_move_out(manager) or
                False
            )
        },
        'cards': [
            card(c)
            for c in Card.objects.filter(
                board=obj.board,
                column=obj
            ).select_related()
        ]
    }


@serialiser('cards', Card)
def card(obj, manager=None):
    return {
        'id': obj.pk,
        'type': 'cards',
        'attributes': {
            'name': str(obj),
            'column': obj.column_id,
            'ordering': obj.ordering,
            'created': obj.created.isoformat(),
            'updated': obj.updated and obj.updated.isoformat(),
            'stage': obj.deliverable.stage_id
        },
        'links': {
            'detail': obj.get_absolute_url()
        }
    }


@serialiser('deliverables', Deliverable)
def deliverable(obj):
    return {
        'id': obj.pk,
        'type': 'deliverables',
        'attributes': {
            'name': str(obj),
            'stage': obj.stage_id and include(
                type='stages',
                id=obj.stage_id
            ) or None,
            'created': obj.created.isoformat(),
            'updated': obj.updated and obj.updated.isoformat(),
            'due': obj.due and obj.due.isoformat()
        },
        'links': {
            'detail': obj.get_absolute_url()
        }
    }


@serialiser('tasks', Task)
def task(obj):
    return {
        'id': obj.pk,
        'attributes': {
            'name': str(obj),
            'completed': obj.completion_date is not None,
            'tags': list(obj.tags.values_list('tag', flat=True)),
            'evidence': obj.evidence_direction and {
                'tags': list(
                    obj.evidence_tags.values_list('tag', flat=True)
                ),
                'categories': [
                    {
                        'type': 'evidence-categories',
                        'id': c.pk,
                        'attributes': {
                            'name': c.name
                        }
                    } for c in obj.evidence_categories.all()
                ],
                'direction': obj.evidence_direction
            } or {}
        }
    }


@serialiser('evidence', EvidencePiece)
def evidence(obj):
    return {
        'id': obj.pk,
        'attributes': {
            'name': str(obj),
            'notes': obj.notes,
            'mime_type': obj.mime_type,
            'media': obj.media and obj.media.url or None,
            'creator': {
                'type': 'users',
                'id': md5(
                    str(obj.creator_id).encode('utf-8')
                ).hexdigest(),
                'attributes': {
                    'first_name': obj.creator.first_name,
                    'last_name': obj.creator.last_name,
                    'email_md5': (
                        obj.creator.email and
                        md5(
                            obj.creator.email.encode('utf-8')
                        ).hexdigest() or
                        None
                    )
                }
            },
            'created': obj.created.isoformat(),
            'updated': obj.updated and obj.updated.isoformat(),
        }
    }
