from .views.projects import (
    ProjectListView,
    CreateProjectView,
    UpdateProjectView,
    ProjectDetailView
)

from .views.boards import BoardDetailView
from .views.deliverables import (
    DeliverableDetailView,
    DeliverableEvidenceView,
    DeliverableEvidenceDownloadView
)

from django.urls import path, re_path


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
        '<slug>/',
        ProjectDetailView.as_view(),
        name='project_detail'
    ),
    path(
        '<slug>/settings/',
        UpdateProjectView.as_view(),
        name='update_project'
    ),
    path(
        '<project__slug>/deliverables/<slug>/',
        DeliverableDetailView.as_view(),
        name='deliverable_detail'
    ),
    path(
        '<project__slug>/deliverables/<slug>/evidence/',
        DeliverableEvidenceView.as_view(),
        name='deliverable_evidence_submit'
    ),
    path(
        '<project__slug>/<slug>/',
        BoardDetailView.as_view(),
        name='board_detail'
    ),
    re_path(
        r'^(?P<name>[\w\/\-]+\.[\w]+)$',
        DeliverableEvidenceDownloadView.as_view(),
        name='evidence_download'
    )
]
