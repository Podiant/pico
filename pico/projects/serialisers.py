from .models import Card


def column(obj):
    return {
        'id': obj.pk,
        'type': 'columns',
        'attributes': {
            'name': obj.name,
            'can_create_cards': obj.can_create_cards,
            'can_move_in': obj.can_move_in,
            'can_move_out': obj.can_move_out
        },
        'cards': [
            card(c)
            for c in Card.objects.filter(
                board=obj.board,
                column=obj
            )
        ]
    }


def card(obj):
    return {
        'id': obj.pk,
        'type': 'cards',
        'attributes': {
            'name': str(obj),
            'column': obj.column_id,
            'created': obj.created.isoformat(),
            'updated': obj.updated and obj.updated.isoformat()
        }
    }
