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
