from django.contrib import admin
from django.urls import include, path, re_path
from .onboarding import urls as onboarding
from .projects import urls as projects


urlpatterns = [
    path('admin/', admin.site.urls),
    re_path(r'^accounts/', include('allauth.urls')),
    path('onboarding/', include(onboarding)),
    path('projects/', include(projects))
]
