from django.contrib.auth.mixins import PermissionRequiredMixin
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import UploadedFile
from django.http.response import Http404, HttpResponse
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext as _
from django.views.generic.base import View
from django.views.generic.detail import DetailView
from logging import getLogger
from pico.core.mixins import SiteMixin
from ..models import Deliverable, TaskEvidenceTag, EvidenceCategory
import json


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


class DeliverableEvidenceView(PermissionRequiredMixin, View):
    permission_required = ('projects.add_evidencepiece',)

    def get_object(self):
        if not hasattr(self, 'object'):
            self.object = get_object_or_404(
                Deliverable,
                project__slug=self.kwargs['project__slug'],
                slug=self.kwargs['slug']
            )

        return self.object

    def has_permission(self):
        if not self.request.user.is_authenticated:
            return False

        perms = [
            p.split('.')[1]
            for p in self.get_permission_required()
        ]

        obj = self.get_object()
        return obj.project.user_has_perm(self.request.user, *perms)

    def http_method_not_allowed(self, request, *args, **kwargs):
        return HttpResponse(
            json.dumps(
                {
                    'error': 'Method not allowed',
                    'status': 405
                },
                indent=4
            ),
            content_type='application/json',
            status=405
        )

    def handle_no_permission(self):
        return HttpResponse(
            json.dumps(
                {
                    'error': 'Forbidden',
                    'status': 403
                },
                indent=4
            ),
            content_type='application/json',
            status=403
        )

    def post(self, request, *args, **kwargs):
        if not any(request.FILES):
            raise ValidationError(
                {
                    '__all__': _('No files submitted')
                }
            )

        file = request.FILES['files[]']
        upload = UploadedFile(file)
        filename = upload.name
        filesize = upload.file.size

        logger = getLogger()
        logger.info('%s = %d' % (filename, filesize))

        return HttpResponse(
            json.dumps(
                [
                    {
                        'name': filename,
                        'size': filesize
                    }
                ]
            ),
            content_type='application/json'
        )

    def dispatch(self, *args, **kwargs):
        logger = getLogger()

        try:
            return super().dispatch(*args, **kwargs)
        except Http404:
            return HttpResponse(
                json.dumps(
                    {
                        'error': 'Not found',
                        'status': 404
                    },
                    indent=4
                ),
                content_type='application/json',
                status=404
            )
        except ValidationError as ex:
            return HttpResponse(
                json.dumps(
                    {
                        'error': 'Unprocessable entity',
                        'status': 422,
                        'detail': ex.args[0]
                    },
                    indent=4
                ),
                content_type='application/json',
                status=422
            )
        except Exception:  # pragma: no cover
            logger.error('Internal server error', exc_info=True)
            return HttpResponse(
                json.dumps(
                    {
                        'error': 'Internal server error',
                        'status': 500
                    },
                    indent=4
                ),
                content_type='application/json',
                status=500
            )
