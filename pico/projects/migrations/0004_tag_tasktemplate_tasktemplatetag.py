# Generated by Django 3.0.2 on 2020-02-01 14:46

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0003_auto_20200201_1348'),
    ]

    operations = [
        migrations.CreateModel(
            name='TaskTemplate',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100)),
                ('start_delta', models.CharField(blank=True, max_length=100, null=True)),
                ('due_delta', models.CharField(blank=True, max_length=100, null=True)),
                ('ordering', models.PositiveIntegerField(default=0)),
                ('description', models.TextField(blank=True, null=True)),
                ('stage', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='task_templates', to='projects.Stage')),
            ],
            options={
                'ordering': ('ordering',),
            },
        ),
        migrations.CreateModel(
            name='TaskTemplateTag',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tag', models.CharField(max_length=100)),
                ('template', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tags', to='projects.TaskTemplate')),
            ],
            options={
                'unique_together': {('tag', 'template')},
            },
        ),
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tag', models.CharField(db_index=True, max_length=100)),
                ('manager', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tags', to='projects.Manager')),
            ],
            options={
                'unique_together': {('tag', 'manager')},
            },
        ),
    ]
