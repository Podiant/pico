# Pico

Pico (as in "de gallo") is a project management tool for podcasters, created by Mark Steadman of [Radio Burrito](https://radioburrito.com/). It helps him manage his workload, but more importantly provides a place for clients to upload their audio and add notes to episodes.

## Requirements

To run in development mode, the project just requires Python 3.

## Installing Pico

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

## Roadmap

The aim is to run an alpha of Pico some time between the spring and summer of 2020. It will have basic features like adding podcasts and giving clients a space to upload audio.

Future improvements will include the ability to post episodes directly to hosting platforms, or perhaps even for the service to run its own basic RSS feed and simple website, so that a podcast can be launched on a user's own stack.

## Using Pico

The intent is to make Pico free and open source, with guides on deploying it to a simple VPS (virtual private server) provided by Linode, DigitalOcean or the like. I don't see the need to go down the road of making this a distributed, cloud-enabled app. If that ends up being a requirement, putting a CDN in front of the app is probably a better way to go.

Right now, there is no support provided for Pico. If you come across bugs, please raise an issue. You can also find @[radioburrito](https://twitter.com/radioburrito/) on Twitter.

Please don't install this if you're not technically minded. Not because anything is likely to explode, but because the project is at an embryonic stage and is only meant to be run in a limited number of places (locally on a Mac, and shortly via Docker container).

## License

You're free to use the project for any purpose, including commercially, for free. If you modify the source, you need to contribute it back to the community, ideally by forking this repo. You can't make derivative works from Pico that are not open source.
