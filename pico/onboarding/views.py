from django.conf import settings
from django.contrib import messages
from django.contrib.auth import login
from django.contrib.auth.models import User
from django.contrib.sites.models import Site
from django.http.response import HttpResponseRedirect
from django.urls import reverse
from django.utils.translation import gettext as _
from django.views.generic.edit import FormView
from pico.core.mixins import SiteMixin
from .forms import OnboardingForm


class OnboardingView(SiteMixin, FormView):
    form_class = OnboardingForm
    template_name = 'onboarding/onboarding_form.html'
    success_url = settings.ONBOARDING_REDIRECT_URL

    def get(self, request):
        if User.objects.exists():
            messages.warning(
                request,
                _('It looks like you\'re already setup.')
            )

            return HttpResponseRedirect(
                reverse('home')
            )

        site = Site.objects.get_current()
        host = request.get_host()

        if site.domain != host:
            site.name = 'Pico'
            site.domain = host
            site.save()

        return super().get(request)

    def form_valid(self, form):
        user = form.save(self.request)
        messages.success(self.request, _('Welcome aboard!'))
        login(
            self.request,
            user,
            'django.contrib.auth.backends.ModelBackend'
        )

        return super().form_valid(form)
