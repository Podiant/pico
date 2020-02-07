from django.contrib.auth.mixins import PermissionRequiredMixin
from django.views.generic.detail import DetailView
from pico.core.mixins import SiteMixin
from ..models import Deliverable, TaskEvidenceTag, EvidenceCategory


class DeliverableDetailView(SiteMixin, PermissionRequiredMixin, DetailView):
    model = Deliverable
    permission_required = ('projects.change_deliverable',)

    def has_permission(self):
        perms = [
            p.split('.')[1]
            for p in self.get_permission_required()
        ]

        obj = self.get_object()
        return obj.project.user_has_perm(self.request.user, *perms)

    def get_queryset(self):
        return super().get_queryset().filter(
            project__slug=self.kwargs['project__slug']
        )

    def get_context_data(self, **kwargs):
        obj = self.object

        evidence_tags = TaskEvidenceTag.objects.filter(
            task__evidence_direction='up',
            task__deliverable=obj
        ).values_list(
            'tag',
            flat=True
        ).distinct()

        evidence_categories = EvidenceCategory.objects.filter(
            tags__tag__in=evidence_tags
        ).distinct()

        context = super().get_context_data(**kwargs)
        context['evidence_categories'] = evidence_categories

        return context
