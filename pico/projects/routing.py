from django.urls import re_path
from .consumers import BoardConsumer, TasksConsumer


websocket_urlpatterns = [
    re_path(
        r'ws/kanban/(?P<project__slug>[\w-]+)/(?P<slug>[\w-]+)/$',
        BoardConsumer
    ),
    re_path(
        r'ws/projects/(?P<project__slug>[\w-]+)/deliverables/(?P<slug>[\w-]+)/tasks/$',  # NOQA
        TasksConsumer
    )
]
