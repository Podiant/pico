from django.db import models, transaction
from django.utils.translation import gettext as _
import json


class Stream(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True, null=True, blank=True)
    participants = models.ManyToManyField(
        'auth.User',
        related_name='streams'
    )

    class Meta:
        ordering = ('-created',)
        get_latest_by = 'created'


class Post(models.Model):
    stream = models.ForeignKey(
        Stream,
        related_name='posts',
        on_delete=models.CASCADE
    )

    title = models.CharField(max_length=280)
    posted = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(
        'auth.User',
        related_name='activity_posts',
        on_delete=models.SET_NULL,
        null=True
    )

    read_by = models.ManyToManyField(
        'auth.User',
        related_name='read_activity_posts',
        blank=True
    )

    kind = models.CharField(
        max_length=7,
        choices=(
            ('info', _('info')),
            ('success', _('success')),
            ('warning', _('warning')),
            ('danger', _('danger'))
        )
    )

    data = models.TextField()

    def get_data(self):
        return json.loads(self.data)

    def set_data(self, data):
        self.data = json.dumps(data)

    def __str__(self):
        return self.title

    @transaction.atomic()
    def save(self, *args, **kwargs):
        new = not self.pk
        super().save(*args, **kwargs)

        if new:
            self.read_by.add(self.author)

    class Meta:
        ordering = ('-posted',)
        get_latest_by = 'posted'


class PostTag(models.Model):
    post = models.ForeignKey(
        Post,
        related_name='tags',
        on_delete=models.CASCADE
    )

    tag = models.CharField(max_length=100)

    def __str__(self):
        return self.tag

    class Meta:
        ordering = ('tag',)
        unique_together = ('tag', 'post')
