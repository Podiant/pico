from django.contrib import messages
from django.contrib.auth.mixins import (
    LoginRequiredMixin,
    PermissionRequiredMixin
)

from django.http.response import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.urls import reverse
from django.utils.translation import gettext as _
from django.views.generic.detail import DetailView
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from django.views.generic.list import ListView
from pico.core.mixins import SiteMixin
from ..forms import CreateProjectForm, ProjectManagerForm
from ..models import Project, Manager


class ProjectListView(SiteMixin, LoginRequiredMixin, ListView):
    model = Project

    def get_queryset(self):
        return super().get_queryset().filter(
            managers__user=self.request.user
        ).distinct()


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
            _('Project "%s" created.') % form.instance.name
        )

        return response

    def get_success_url(self):
        board = self.object.boards.get(default=True)
        return board.get_absolute_url()


class ProjectMixin(PermissionRequiredMixin):
    model = Project
    permission_required = ('projects.change_project',)

    def get_project(self):
        return self.get_object()

    def has_permission(self):
        if self.request.user.is_anonymous:
            return False

        perms = [
            p.split('.')[1]
            for p in self.get_permission_required()
        ]

        obj = self.get_project()
        return obj.user_has_perm(self.request.user, *perms)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['project'] = self.get_project()

        return context


class UpdateProjectView(SiteMixin, ProjectMixin, UpdateView):
    fields = ('name', 'artwork')

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(
            self.request,
            _('Project "%s" updated.') % form.instance.name
        )

        return response

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['can_update_artwork'] = True

        return context


class ProjectDetailView(SiteMixin, ProjectMixin, DetailView):
    def get(self, request, *args, **kwargs):
        board = self.get_object().boards.get(default=True)

        return HttpResponseRedirect(
            board.get_absolute_url()
        )


class ProjectManagerMixin(SiteMixin, ProjectMixin):
    model = Manager

    def get_queryset(self):
        return super().get_queryset().filter(
            project__slug=self.kwargs['project__slug']
        ).select_related()

    def get_project(self):
        return get_object_or_404(
            Project,
            managers__user=self.request.user,
            slug=self.kwargs['project__slug']
        )


class ProjectManagerListView(ProjectManagerMixin, ListView):
    pass


class ProjectManagerCreateView(ProjectManagerMixin, CreateView):
    pass


class ProjectManagerUpdateView(ProjectManagerMixin, UpdateView):
    form_class = ProjectManagerForm

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(
            self.request,
            _('Settings for %s updated.') % self.object.user.get_full_name()
        )

        return response

    def get_success_url(self):
        project = self.get_project()
        return reverse('project_manager_list', args=[project.slug])


class ProjectManagerDeleteView(ProjectManagerMixin, DeleteView):
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(
            self.request,
            _('%s has been removed from the project.') % (
                self.object.user.get_full_name()
            )
        )

        return response

    def get_success_url(self):
        project = self.get_project()
        return reverse('project_manager_list', args=[project.slug])
