from django.urls import re_path
from .consumers import EmailUniquenessConsumer, PasswordValidationConsumer


websocket_urlpatterns = [
    re_path(r'ws/unique/email/$', EmailUniquenessConsumer),
    re_path(r'ws/validate/password/$', PasswordValidationConsumer)
]
