from django.urls import re_path
from .consumers import BoardConsumer


websocket_urlpatterns = [
    re_path(
        r'ws/kanban/(?P<project__slug>[\w-]+)/(?P<slug>[\w-]+)/$',
        BoardConsumer
    )
]
