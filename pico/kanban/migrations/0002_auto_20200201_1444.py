# Generated by Django 3.0.2 on 2020-02-01 14:44

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('kanban', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='column',
            name='can_create_cards',
            field=models.CharField(default='', max_length=255),
        ),
        migrations.AlterField(
            model_name='column',
            name='can_move_in',
            field=models.CharField(default='', max_length=255),
        ),
        migrations.AlterField(
            model_name='column',
            name='can_move_out',
            field=models.CharField(default='', max_length=255),
        ),
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tag', models.CharField(db_index=True, max_length=100)),
                ('manager', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tags', to='kanban.Manager')),
            ],
            options={
                'unique_together': {('tag', 'manager')},
            },
        ),
    ]
