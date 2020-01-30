import dj_database_url
import os


BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = not not os.getenv('DEBUG')
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'channels'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware'
]

ROOT_URLCONF = 'pico.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages'
            ]
        }
    }
]

WSGI_APPLICATION = 'pico.wsgi.application'
ASGI_APPLICATION = 'pico.routing.application'

DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///%s' % os.path.join(BASE_DIR, 'db.sqlite3')
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'  # NOQA
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'  # NOQA
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'  # NOQA
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'  # NOQA
    }
]

LANGUAGE_CODE = 'en-gb'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

STATIC_URL = os.getenv('STATIC_URL') or '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]
STATIC_ROOT = os.getenv('STATIC_ROOT')

MEDIA_URL = os.getenv('MEDIA_URL') or '/media/'
MEDIA_ROOT = os.getenv('MEDIA_ROOT') or os.path.join(BASE_DIR, 'media')
