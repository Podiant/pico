# Generated by Django 3.0.2 on 2020-02-01 13:48

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('kanban', '0001_initial'),
        ('projects', '0002_board_card_deliverable'),
    ]

    operations = [
        migrations.CreateModel(
            name='Stage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('colour', models.CharField(choices=[('fff', 'white'), ('e9ecef', 'light grey'), ('adb5bd', 'grey'), ('343a40', 'dark grey'), ('000', 'black'), ('007bff', 'blue'), ('6610f2', 'indigo'), ('6f42c1', 'purple'), ('e83e8c', 'pink'), ('dc3545', 'red'), ('fd7e14', 'orange'), ('ffc107', 'yellow'), ('28a745', 'green'), ('20c997', 'teal'), ('17a2b8', 'cyan')], default='17a2b8', max_length=6)),
                ('ordering', models.PositiveIntegerField(default=0)),
                ('board_column', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='kanban.Column')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='stages', to='projects.Project')),
            ],
            options={
                'ordering': ('ordering',),
            },
        ),
        migrations.AddField(
            model_name='deliverable',
            name='stage',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='deliverables', to='projects.Stage'),
        ),
    ]
