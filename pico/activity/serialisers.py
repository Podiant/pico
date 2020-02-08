from hashlib import md5


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

    attrs.update(post.get_data())

    return {
        'type': 'activity',
        'id': post.pk,
        'attributes': attrs
    }
