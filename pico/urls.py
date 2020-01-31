from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic.base import RedirectView
from .onboarding import urls as onboarding
from .projects import urls as projects


urlpatterns = [
    path('', RedirectView.as_view(pattern_name='project_list'), name='home'),
    path('admin/', admin.site.urls),
    re_path(r'^accounts/', include('allauth.urls')),
    path('onboarding/', include(onboarding)),
    path('projects/', include(projects))
]
