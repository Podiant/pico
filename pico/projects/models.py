from django.contrib.auth.models import Permission as DjangoPermission
from django.db import models, transaction
from django.dispatch import receiver
from pico.onboarding.signals import user_onboarded
from . import helpers, permissions


class Project(models.Model):
    name = models.CharField(max_length=100)
    slug = models.CharField(max_length=16, unique=True)
    creator = models.ForeignKey(
        'auth.User',
        related_name='created_projects',
        null=True,
        on_delete=models.SET_NULL
    )

    artwork = models.ImageField(
        max_length=100,
        upload_to=helpers.upload_project_image
    )

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True, null=True, blank=True)

    permissions = (
        ('update_project', permissions.UPDATE_PROJECT),
        ('delete_project', permissions.DELETE_PROJECT)
    )

    def __str__(self):
        return self.name

    @transaction.atomic()
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = helpers.uniqid()

        super().save(*args, **kwargs)

        manager = self.managers.create(user=self.creator)
        for (code, perm_name) in self.permissions:
            manager.permissions.create(
                code=code,
                name=perm_name
            )

    def user_can(self, user, *permissions):
        user_permissions = list(
            Permission.objects.filter(
                manager__user=user,
                manager__project=self,
                code__in=permissions
            ).values_list(
                'code',
                flat=True
            ).order_by(
                'code'
            )
        )

        for p in permissions:
            if p not in user_permissions:
                return False

        return any(user_permissions)

    class Meta:
        ordering = ('-updated',)
        get_latest_by = 'created'


class DirectoryListing(models.Model):
    project = models.ForeignKey(
        Project,
        related_name='directory_listings',
        on_delete=models.CASCADE
    )

    directory = models.CharField(
        max_length=10,
        choices=(
            ('apple', 'Apple Podcasts'),
            ('deezer', 'Deezer'),
            ('google', 'Google Podcasts'),
            ('spotify', 'Spotify'),
            ('stitcher', 'Stitcher'),
            ('tunein', 'TuneIn')
        )
    )

    url = models.URLField('URL', max_length=512)

    def __str__(self):
        return self.directory

    class Meta:
        unique_together = ('directory', 'project')
        ordering = ('directory', 'project__name')


class Manager(models.Model):
    project = models.ForeignKey(
        Project,
        related_name='managers',
        on_delete=models.CASCADE
    )

    user = models.ForeignKey(
        'auth.User',
        related_name='management_roles',
        on_delete=models.CASCADE
    )

    class Meta:
        unique_together = ('user', 'project')
        ordering = (
            'user__last_name',
            'user__first_name',
            'user__email',
            'project__name'
        )


class Permission(models.Model):
    manager = models.ForeignKey(
        Manager,
        related_name='permissions',
        on_delete=models.CASCADE
    )

    code = models.CharField(max_length=100)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        unique_together = ('code', 'manager')


@receiver(user_onboarded)
def provision_user(sender, user, **kwargs):
    permission = DjangoPermission.objects.get(
        content_type__app_label='projects',
        content_type__model='project',
        codename='add_project'
    )

    user.user_permissions.add(permission)
