from django.dispatch import Signal


user_onboarded = Signal(providing_args=('user',))
