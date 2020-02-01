from django.db.models import Manager


class ProjectManager(Manager):
    def get_by_natural_key(self, slug):
        return self.get(slug=slug)


class BoardManager(Manager):
    def get_by_natural_key(self, project__slug, slug):
        return self.get(
            project__slug=project__slug,
            slug=slug
        )
