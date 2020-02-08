# Generated by Django 3.0.2 on 2020-02-08 09:08

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Stream',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True, null=True)),
                ('participants', models.ManyToManyField(related_name='streams', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ('-created',),
                'get_latest_by': 'created',
            },
        ),
        migrations.CreateModel(
            name='Post',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=280)),
                ('posted', models.DateTimeField(auto_now_add=True)),
                ('kind', models.CharField(choices=[('info', 'info'), ('success', 'success'), ('warning', 'warning'), ('danger', 'danger')], max_length=7)),
                ('data', models.TextField()),
                ('author', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='activity_posts', to=settings.AUTH_USER_MODEL)),
                ('read_by', models.ManyToManyField(blank=True, related_name='read_activity_posts', to=settings.AUTH_USER_MODEL)),
                ('stream', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='posts', to='activity.Stream')),
            ],
            options={
                'ordering': ('-posted',),
                'get_latest_by': 'posted',
            },
        ),
        migrations.CreateModel(
            name='PostTag',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tag', models.CharField(max_length=100)),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tags', to='activity.Post')),
            ],
            options={
                'ordering': ('tag',),
                'unique_together': {('tag', 'post')},
            },
        ),
    ]
