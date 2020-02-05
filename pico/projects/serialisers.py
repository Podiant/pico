from .models import Card


def column(obj, manager=None):
    return {
        'id': obj.pk,
        'type': 'columns',
        'attributes': {
            'name': obj.name,
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
                'direction': obj.evidence_direction
            } or {}
        }
    }
