from django import forms
from django.contrib.auth.models import Permission
from django.contrib.auth.models import User
from django.db import transaction
from django.utils.translation import gettext as _
from pico.kanban.models import Board
from . import helpers
from .models import Project, Manager
import json

ITUNES_URL = '//itunes.apple.com/search?term=%s&media=podcast&callback=?'


class CreateProjectForm(forms.ModelForm):
    name = forms.CharField(max_length=100)
    apple_podcasts_id = forms.CharField(
        max_length=100,
        required=False,
        widget=forms.TextInput(
            attrs={
                'placeholder': _('Search for your podcast by name'),
                'data-typeahead-url': ITUNES_URL,
                'data-typeahead-transform': json.dumps(
                    {
                        'id': 'results.$.trackId',
                        'label': 'results.$.trackName',
                        'thumbnail': 'results.$.artworkUrl60'
                    }
                )
            }
        )
    )

    @transaction.atomic()
    def save(self, commit=True):
        apple_id = self.cleaned_data.get('apple_podcasts_id')
        obj = super().save(commit)

        if apple_id:
            obj.directory_listings.create(
                directory='apple',
                url='https://podcasts.apple.com/podcast/id%s' % apple_id
            )

            helpers.set_artwork_from_apple(obj, apple_id)

        return obj

    class Meta:
        model = Project
        fields = ('name',)


class ProjectManagerForm(forms.ModelForm):
    first_name = forms.CharField()
    last_name = forms.CharField()
    email = forms.EmailField()

    permissions = forms.ModelMultipleChoiceField(
        label=_('Project permissions'),
        widget=forms.CheckboxSelectMultiple(),
        queryset=Permission.objects.filter(
            content_type__app_label='projects',
            codename__in=Project.PERMISSIONS
        ).exclude(
            content_type__model='board'
        )
    )

    def __init__(self, *args, **kwargs):
        instance = kwargs['instance']
        initial = kwargs.pop('initial', {})
        initial = {
            'permissions': list(
                instance.permissions.values_list(
                    'pk',
                    flat=True
                )
            )
        }

        for field in ('first_name', 'last_name', 'email'):
            initial[field] = getattr(instance.user, field)

        super().__init__(initial=initial, *args, **kwargs)
        permissions = self.fields['permissions']
        permissions.choices = permissions.queryset.values_list(
            'pk',
            'name'
        )

        for board in self.instance.project.boards.all():
            key = 'board_%d_permissions' % board.pk
            manager = board.managers.get(user=self.instance.user)
            self.fields[key] = forms.MultipleChoiceField(
                label=_('%s board permissions' % board.name),
                widget=forms.CheckboxSelectMultiple(),
                choices=list(
                    Permission.objects.filter(
                        content_type__app_label='kanban',
                        codename__in=Board.PERMISSIONS
                    ).values_list(
                        'pk',
                        'name'
                    )
                ),
                initial=list(
                    manager.permissions.values_list(
                        'pk',
                        flat=True
                    )
                ),
                required=False
            )

    def clean_email(self):
        email = self.cleaned_data['email']
        if User.objects.filter(
            email__iexact=email
        ).exclude(
            pk=self.instance.user_id
        ).exists():
            raise forms.ValidationError(
                _('Another user is already using this email address.')
            )

        return email

    @transaction.atomic()
    def save(self, commit=True):
        obj = super().save(commit=commit)
        obj.user.first_name = self.cleaned_data['first_name']
        obj.user.last_name = self.cleaned_data['last_name']
        obj.user.email = self.cleaned_data['email']

        if commit:
            obj.user.save()

        return obj

    @transaction.atomic()
    def _save_m2m(self):
        selected_permissions = self.cleaned_data['permissions']

        for perm in selected_permissions:
            self.instance.permissions.add(perm)

        self.instance.permissions.remove(
            *self.instance.permissions.exclude(
                pk__in=selected_permissions
            )
        )

        for board in self.instance.project.boards.all():
            board_manager = board.managers.get(user=self.instance.user)
            selected_board_permissions = self.cleaned_data[
                'board_%d_permissions' % board.pk
            ]

            for perm in selected_board_permissions:
                board_manager.permissions.add(perm)

            board_manager.permissions.remove(
                *board_manager.permissions.exclude(
                    pk__in=selected_board_permissions
                )
            )

    class Meta:
        model = Manager
        fields = ()
