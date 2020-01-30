# Installing Pico

1. Clone this repo or download the archive to a folder where it will live
2. In a terminal, `cd` into that folder
3. Run `python3 -m venv .` to create a new virtualenv
4. Create a `.env` file
5. Add the following:

```sh
source bin/activate
export SECRET_KEY=foo  # Change this to something actually useful and secure
export DEBUG=1
```

(I use [python-dotenv](https://pypi.org/project/python-dotenv/), but you can use another method of setting environment variables if you like. Just so long as you have the `SECRET_KEY` environment variable set in a way your shell can read, you should be good.)

6. In your terminal, type `source .env` (if using the above method)
7. Run `python manage.py migrate && python manage.py runserver`

You should see output like this:

```
System check identified no issues (0 silenced).
January 30, 2020 - 08:29:15
Django version 3.0.2, using settings 'pico.settings'
Starting ASGI/Channels version 2.4.0 development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

Visit `http://127.0.0.1:8000/` in your browser, and you should see the Pico login page.
