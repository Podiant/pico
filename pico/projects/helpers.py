import time
import os


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
