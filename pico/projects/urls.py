from .views.projects import CreateProjectView
from django.urls import path


urlpatterns = [
    path('create/', CreateProjectView.as_view(), name='create_project')
]
