from django import forms
from django.contrib.auth.models import User
from django.utils.translation import gettext as _


class OnboardingForm(forms.Form):
    site_name = forms.CharField(max_length=100)
    email = forms.EmailField(max_length=255)
    name = forms.CharField(max_length=100)
    password1 = forms.CharField(
        widget=forms.PasswordInput,
        label=_('Password')
    )

    password2 = forms.CharField(
        widget=forms.PasswordInput,
        label=_('Password confirmation')
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'].widget.attrs['data-unique'] = 'email'
        self.fields['password1'].widget.attrs['data-validator'] = 'password'
        self.fields['password2'].widget.attrs['data-pair'] = 'password1'

    def clean_email(self):
        if User.objects.filter(
            email__iexact=self.cleaned_data['email']
        ).exists():
            raise forms.ValidationError(
                _(
                    'Looks like someone has already signed up, and used '
                    'that email address.'
                )
            )

    def clean_password2(self):
        password1 = self.cleaned_data['password1']
        password2 = self.cleaned_data['password2']

        if password1 != password2:
            raise forms.ValidationError(
                _('The two password fields didn’t match.')
            )

    def save(self, commit=True):
        if ' ' in self.cleaned_data['name']:
            first_name, last_name = self.cleaned_data['name'].rsplit(' ', 1)
        else:
            first_name = self.cleaned_data['name']
            last_name = ''

        return User.objects.create_user(
            'admin',
            self.cleaned_data['email'],
            self.cleaned_data['password1'],
            first_name=first_name.capitalize(),
            last_name=last_name.capitalize()
        )
