from django.contrib.auth.models import Permission
from django.db import models
from . import permissions
import json


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


class Tag(models.Model):
    manager = models.ForeignKey(
        Manager,
        related_name='tags',
        on_delete=models.CASCADE
    )

    tag = models.CharField(max_length=100, db_index=True)

    def __str__(self):
        return self.name

    class Meta:
        unique_together = ('tag', 'manager')


class Column(models.Model):
    board = models.ForeignKey(
        Board,
        related_name='columns',
        on_delete=models.CASCADE
    )

    name = models.CharField(max_length=100)
    ordering = models.PositiveIntegerField(default=0)
    can_create_cards = models.CharField(max_length=255, default='')
    can_move_in = models.CharField(max_length=255, default='')
    can_move_out = models.CharField(max_length=255, default='')

    def __str__(self):
        return self.name

    def __user_has_tags(self, manager, required_tags):
        manager_tags = list(manager.tags.values_list('tag', flat=True))

        for tag in required_tags:
            if tag in manager_tags:
                return True

        return False  # pragma: no cover

    def user_can_create_cards(self, manager):
        column_tags = json.loads(self.can_create_cards)
        return self.__user_has_tags(manager, column_tags)

    def user_can_move_in(self, manager):
        column_tags = json.loads(self.can_move_in)
        return self.__user_has_tags(manager, column_tags)

    def user_can_move_out(self, manager):
        column_tags = json.loads(self.can_move_out)
        return self.__user_has_tags(manager, column_tags)

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

    ordering = models.PositiveIntegerField(default=0)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True, null=True, blank=True)

    def save(self, *args, **kwargs):
        changed_column = False
        update_fields = list(kwargs.get('update_fields', []))
        old_column = None
        force = False

        if self.pk:
            old = type(self).objects.get(pk=self.pk)
            old_column = old.column
            if old_column.pk != self.column.pk:
                changed_column = True
                self.ordering = self.column.cards.count() + 1

                if 'ordering' not in update_fields:
                    update_fields.append('ordering')
                    force = True
        else:
            changed_column = True

        if self.pk and any(update_fields):
            kwargs['update_fields'] = tuple(update_fields)

        super().save(*args, **kwargs)

        if changed_column and ('ordering' not in update_fields or force):
            for i, card in enumerate(
                self.column.cards.order_by('ordering')
            ):
                card.ordering = i
                card.save(
                    update_fields=('ordering',)
                )

            if old_column is not None:
                for i, card in enumerate(
                    old_column.cards.order_by('ordering')
                ):
                    card.ordering = i
                    card.save(
                        update_fields=('ordering',)
                    )

    class Meta:
        ordering = ('ordering',)
