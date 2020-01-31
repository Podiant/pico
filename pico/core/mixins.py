from django.contrib.sites.models import Site


class SiteMixin(object):
    def get_context_data(self, **kwargs):
        return super().get_context_data(
            current_site=Site.objects.get_current()
        )
