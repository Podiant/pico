from django.views.generic.edit import CreateView
from django.contrib.auth.mixins import PermissionRequiredMixin
from ..models import Project


class CreateProjectView(PermissionRequiredMixin, CreateView):
    model = Project
    permission_required = ('projects.add_project',)
    fields = ('name',)
