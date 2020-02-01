# Generated by Django 3.0.2 on 2020-02-01 10:11

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0011_update_proxy_permissions'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Board',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True, null=True)),
                ('creator', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_boards', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ('name',),
            },
        ),
        migrations.CreateModel(
            name='Column',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('ordering', models.PositiveIntegerField(default=0)),
                ('can_create_cards', models.BooleanField(default=True)),
                ('can_move_in', models.BooleanField(default=True)),
                ('can_move_out', models.BooleanField(default=True)),
                ('board', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='columns', to='kanban.Board')),
            ],
            options={
                'ordering': ('ordering',),
            },
        ),
        migrations.CreateModel(
            name='Card',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('board', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='cards', to='kanban.Board')),
                ('columns', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='cards', to='kanban.Column')),
            ],
        ),
        migrations.CreateModel(
            name='Manager',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('board', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='managers', to='kanban.Board')),
                ('permissions', models.ManyToManyField(related_name='boards', to='auth.Permission')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='board_management_roles', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ('user__last_name', 'user__first_name', 'user__email', 'board__name'),
                'unique_together': {('user', 'board')},
            },
        ),
    ]
