from django.contrib.sites.models import Site
from django.http.response import HttpResponseRedirect
from django.urls import reverse, resolve
from pico import onboarding


class SiteMixin(object):
    def dispatch(self, request, *args, **kwargs):
        if not onboarding.is_ready():
            if not request.path.startswith('/onboarding/'):
                return HttpResponseRedirect(
                    reverse('onboarding_start')
                )

        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['current_site'] = Site.objects.get_current()
        current_url = resolve(self.request.path_info).url_name
        context['url_name'] = current_url

        return context
