from django.db import models


class Board(models.Model):
    name = models.CharField(max_length=100)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True, null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ('name',)


class Column(models.Model):
    board = models.ForeignKey(
        Board,
        related_name='columns',
        on_delete=models.CASCADE
    )

    name = models.CharField(max_length=100)
    ordering = models.PositiveIntegerField(default=0)

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

    columns = models.ForeignKey(
        Column,
        related_name='cards',
        null=True,
        on_delete=models.SET_NULL
    )
