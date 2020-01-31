from django.contrib import messages
from django.contrib.auth.mixins import (
    LoginRequiredMixin,
    PermissionRequiredMixin
)

from django.utils.translation import gettext as _
from django.views.generic.edit import CreateView, UpdateView
from django.views.generic.list import ListView
from pico.core.mixins import SiteMixin
from ..forms import CreateProjectForm
from ..models import Project


class ProjectListView(SiteMixin, LoginRequiredMixin, ListView):
    model = Project


class CreateProjectView(SiteMixin, PermissionRequiredMixin, CreateView):
    model = Project
    permission_required = ('projects.add_project',)
    form_class = CreateProjectForm
    template_name = 'projects/create_project_form.html'

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['instance'] = Project(creator=self.request.user)

        return kwargs

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(
            self.request,
            _('Project "%s" created.' % form.instance.name)
        )

        return response


class UpdateProjectView(SiteMixin, PermissionRequiredMixin, UpdateView):
    model = Project
    permission_required = ('projects.change_project',)
    fields = ('name', 'artwork')

    def has_permission(self):
        perms = [
            p.split('.')[1]
            for p in self.get_permission_required()
        ]

        obj = self.get_object()
        return obj.user_has_perm(self.request.user, *perms)

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(
            self.request,
            _('Project "%s" updated.' % form.instance.name)
        )

        return response
