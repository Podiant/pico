from django.contrib.auth.models import Permission
from django.db import models
from . import permissions


class Board(models.Model):
    name = models.CharField(max_length=100)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True, null=True, blank=True)
    creator = models.ForeignKey(
        'auth.User',
        related_name='created_boards',
        null=True,
        on_delete=models.SET_NULL
    )

    PERMISSIONS = (
        permissions.CHANGE_BOARD,
        permissions.DELETE_BOARD,
        permissions.CREATE_COLUMN,
        permissions.CHANGE_COLUMN,
        permissions.DELETE_COLUMN,
        permissions.CREATE_CARD,
        permissions.CHANGE_CARD,
        permissions.DELETE_CARD
    )

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        new = not self.pk
        super().save(*args, **kwargs)

        if new:
            manager = self.managers.create(user=self.creator)

            for codename in self.PERMISSIONS:
                djp = Permission.objects.get(
                    content_type__app_label='kanban',
                    codename=codename
                )

                manager.permissions.add(djp)

    def user_has_perm(self, user, *permissions):
        user_permissions = list(
            Permission.objects.filter(
                boards__user=user,
                boards__board=self,
                content_type__app_label='kanban',
                codename__in=permissions
            ).values_list(
                'codename',
                flat=True
            ).order_by(
                'codename'
            )
        )

        for p in permissions:
            if p not in user_permissions:
                return False

        return any(user_permissions)

    class Meta:
        ordering = ('name',)


class Manager(models.Model):
    board = models.ForeignKey(
        Board,
        related_name='managers',
        on_delete=models.CASCADE
    )

    user = models.ForeignKey(
        'auth.User',
        related_name='board_management_roles',
        on_delete=models.CASCADE
    )

    permissions = models.ManyToManyField(
        Permission,
        related_name='boards'
    )

    class Meta:
        unique_together = ('user', 'board')
        ordering = (
            'user__last_name',
            'user__first_name',
            'user__email',
            'board__name'
        )


class Column(models.Model):
    board = models.ForeignKey(
        Board,
        related_name='columns',
        on_delete=models.CASCADE
    )

    name = models.CharField(max_length=100)
    ordering = models.PositiveIntegerField(default=0)
    can_create_cards = models.BooleanField(default=True)
    can_move_in = models.BooleanField(default=True)
    can_move_out = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ('ordering',)


class Card(models.Model):
    board = models.ForeignKey(
        Board,
        related_name='cards',
        on_delete=models.CASCADE
    )

    column = models.ForeignKey(
        Column,
        related_name='cards',
        null=True,
        on_delete=models.SET_NULL
    )
