from django.db.models import Manager


class ProjectManager(Manager):
    def get_by_natural_key(self, slug):
        return self.get(slug=slug)
