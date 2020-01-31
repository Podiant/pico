from django.conf import settings
from mimetypes import guess_type
import json
import os


class MockResponse(object):
    def __init__(self, fixture):
        mimetype, encoding = guess_type(fixture)

        self.headers = {
            'Content-Type': mimetype
        }

        with open(fixture, 'rb') as f:
            self.content = f.read()

        self.iter_content = lambda chunk_size=None: [
            open(fixture, 'rb').read()
        ]

        self.json = lambda: json.loads(self.content)

    def raise_for_status(self):
        pass


class NotFound(object):
    def __init__(self, url):
        self.url = url

    def raise_for_status(self):
        raise Exception('Not found', self.url)


def mock_request():
    def f(url, *args, **kwargs):
        if 'itunes.apple.com/search' in url:
            return MockResponse(
                os.path.join(
                    settings.BASE_DIR,
                    'pico',
                    'projects',
                    'fixtures',
                    'test_apple_podcasts.json'
                )
            )

        if 'feeds.podiant.co' in url:
            return MockResponse(
                os.path.join(
                    settings.BASE_DIR,
                    'pico',
                    'projects',
                    'fixtures',
                    'test_rss.xml'
                )
            )

        if 'media.podiant.co' in url:
            if 'artwork.png' in url:
                return MockResponse(
                    os.path.join(
                        settings.BASE_DIR,
                        'pico',
                        'projects',
                        'fixtures',
                        'test_artwork.png'
                    )
                )

        return NotFound(url)

    return f
