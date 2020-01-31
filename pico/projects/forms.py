from django import forms
from django.db import transaction
from django.utils.translation import gettext as _
from . import helpers
from .models import Project
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
