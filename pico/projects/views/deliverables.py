from django.contrib.auth.mixins import PermissionRequiredMixin
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import UploadedFile
from django.db import transaction
from django.http.response import Http404, HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.translation import gettext as _
from django.views.generic.base import View
from django.views.generic.detail import DetailView
from logging import getLogger
from pico.core.mixins import SiteMixin
from tempfile import mkstemp
from ..models import Deliverable, EvidencePiece
import json
import os
import uuid


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
        guid = str(uuid.uuid4())

        ext = os.path.splitext(filename)[-1]
        handle, tmp_filename = mkstemp(ext)

        try:
            for chunk in upload.chunks():
                os.write(handle, chunk)
        finally:
            os.close(handle)

        cache.set('files.%s' % guid, tmp_filename, 60 * 60)

        return HttpResponse(
            json.dumps(
                {
                    'data': {
                        'name': filename,
                        'size': filesize,
                        'id': guid
                    }
                }
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


class DeliverableEvidenceDownloadView(PermissionRequiredMixin, View):
    permission_required = ('projects.change_evidencepiece',)

    def get_object(self):
        if not hasattr(self, 'object'):
            self.object = get_object_or_404(
                EvidencePiece,
                media='projects/%s' % self.kwargs['name']
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
        return obj.deliverable.project.user_has_perm(
            self.request.user,
            *perms
        )

    def get(self, *args, **kwargs):
        obj = self.get_object()

        if self.request.method == 'GET':
            with transaction.atomic():
                tags = obj.tags.values_list('tag', flat=True)
                tasks = obj.deliverable.tasks.filter(
                    evidence_direction='down',
                    completion_date__isnull=True
                )

                for tag in tags:
                    tasks = tasks.filter(evidence_tags__tag=tag)

                for task in tasks:
                    task.completion_date = timezone.now()
                    task.completed_by = self.request.user
                    task.save()

        response = HttpResponse(
            content_type=obj.mime_type
        )

        response['Content-Length'] = obj.media.size
        response['Content-Disposition'] = 'attachment; filename=%s' % obj.name

        if self.request.method == 'GET':
            response['X-Accel-Redirect'] = obj.media.path

        return response
