from django.views.generic.detail import DetailView
from django.contrib.auth.mixins import PermissionRequiredMixin
from pico.core.mixins import SiteMixin
from ..models import Board


class BoardDetailView(SiteMixin, PermissionRequiredMixin, DetailView):
    model = Board
    permission_required = ('kanban.change_board',)

    def has_permission(self):
        if self.request.user.is_anonymous:
            return False

        perms = [
            p.split('.')[1]
            for p in self.get_permission_required()
        ]

        obj = self.get_object()
        return obj.user_has_perm(self.request.user, *perms)
