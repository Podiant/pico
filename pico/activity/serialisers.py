from hashlib import md5
from logging import getLogger
from ..serialisation import serialiser, include, SerialisationError
from .models import Post


@serialiser('activity', Post)
def post(post, user):
    attrs = {
        'title': post.title,
        'created': post.posted.isoformat(),
        'creator': {
            'type': 'users',
            'id': md5(
                str(post.author_id).encode('utf-8')
            ).hexdigest(),
            'attributes': {
                'first_name': post.author.first_name,
                'last_name': post.author.last_name,
                'email_md5': (
                    post.author.email and
                    md5(
                        post.author.email.encode('utf-8')
                    ).hexdigest() or
                    None
                ),
                'me': post.author.pk == user.pk
            }
        },
        'read': post.read_by.filter(pk=user.pk).exists(),
        'tags': list(post.tags.values_list('tag', flat=True)),
        'kind': post.kind
    }

    logger = getLogger()
    data = post.get_data()

    if '_include' in data:
        for key, kwargs in data['_include'].items():
            try:
                attrs[key] = include(**kwargs)
            except (SerialisationError, TypeError):
                logger.error(
                    'Error serialising include "%s".' % key,
                    exc_info=True
                )

    return {
        'type': 'activity',
        'id': post.pk,
        'attributes': attrs
    }
