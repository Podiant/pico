from django.urls import re_path
from .consumers import EmailUniquenessConsumer


websocket_urlpatterns = [
    re_path(r'ws/unique/email/$', EmailUniquenessConsumer)
]
