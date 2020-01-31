from .views.projects import (
    ProjectListView,
    CreateProjectView,
    UpdateProjectView
)

from django.urls import path


urlpatterns = [
    path(
        '',
        ProjectListView.as_view(),
        name='project_list'
    ),
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
