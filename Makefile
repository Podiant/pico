run:
	python manage.py migrate && python manage.py runserver

test:
	DJANGO_SETTINGS_MODULE=pico.settings py.test --cov pico --cov-report html pico
