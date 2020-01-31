def is_ready():
    from django.contrib.auth.models import User

    return User.objects.filter(
        user_permissions__content_type__app_label='projects',
        user_permissions__codename='add_project'
    )
