from django.contrib import admin
from django.urls import include, path, re_path
from .onboarding import urls as onboarding


urlpatterns = [
    path('admin/', admin.site.urls),
    re_path(r'^accounts/', include('allauth.urls')),
    path('onboarding/', include(onboarding))
]
