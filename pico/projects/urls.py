from .views.projects import CreateProjectView, UpdateProjectView
from django.urls import path


urlpatterns = [
    path(
        'create/',
        CreateProjectView.as_view(),
        name='create_project'
    ),
    path(
        '<slug>/settings/',
        UpdateProjectView.as_view(),
        name='update_project'
    )
]
