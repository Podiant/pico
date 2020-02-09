from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.urls import reverse
import os


class PrivateFileSystemStorage(FileSystemStorage):
    def __init__(self):
        super().__init__(
            location=os.path.join(
                settings.BASE_DIR,
                'private',
                'media'
            )
        )


class EvidenceStorage(PrivateFileSystemStorage):
    def url(self, name):
        return reverse(
            'evidence_download',
            args=[name[9:]]
        )
