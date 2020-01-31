from django.core.files import File
from tempfile import mkstemp
from urllib.parse import urlparse
import feedparser
import os
import requests
import time


def uniqid():
    return hex(
        int(time.time())
    )[2:10] + hex(
        int(time.time() * 1000000) % 0x100000
    )[2:7]


def upload_project_image(instance, filename):
    ext = os.path.splitext(filename)[-1]

    return os.path.join(
        'projects',
        uniqid() + ext
    )


def set_artwork_from_url(instance, image_url):
    basename = urlparse(image_url).path
    ext = os.path.splitext(basename)[-1]
    handle, filename = mkstemp(ext)

    try:
        response = requests.get(image_url, stream=True)
        response.raise_for_status()

        for chunk in response.iter_content(chunk_size=1024*1024):
            os.write(handle, chunk)
    finally:
        os.close(handle)

    instance.artwork = File(
        open(filename, 'rb')
    )

    instance.save()


def set_artwork_from_feed(instance, feed_url):
    response = requests.get(feed_url)
    response.raise_for_status()

    feed = feedparser.parse(response.content)

    if feed.feed.image:
        set_artwork_from_url(instance, feed.feed.image['href'])


def set_artwork_from_apple(instance, apple_id):
    response = requests.get(
        'https://itunes.apple.com/search?term=%s' % apple_id
    )

    response.raise_for_status()
    data = response.json()

    for result in data.get('results', []):
        if str(result['trackId']) == str(apple_id):
            feed_url = result['feedUrl']
            set_artwork_from_feed(instance, feed_url)
            return
