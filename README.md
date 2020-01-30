# Pico

[![Build Status](https://travis-ci.com/Podiant/pico.svg?branch=master)](https://travis-ci.com/Podiant/pico)
[![Coverage Status](https://coveralls.io/repos/github/Podiant/pico/badge.svg?branch=master)](https://coveralls.io/github/Podiant/pico?branch=master)
[![Documentation Status](https://readthedocs.org/projects/picopodcasting/badge/?version=latest)](https://picopodcasting.readthedocs.io/en/latest/)

Pico (as in "de gallo") is a project management tool for podcasters, created by Mark Steadman of [Radio Burrito](https://radioburrito.com/). It helps him manage his workload, but more importantly provides a place for clients to upload their audio and add notes to episodes.

## Requirements

To run in development mode, the project just requires Python 3.

## Documentation

You'll find documentation at [picopodcasting.readthedocs.io](https://picopodcasting.readthedocs.io/en/latest/).

## Roadmap

The aim is to run an alpha of Pico some time between the spring and summer of 2020. It will have basic features like adding podcasts and giving clients a space to upload audio.

Future improvements will include the ability to post episodes directly to hosting platforms, or perhaps even for the service to run its own basic RSS feed and simple website, so that a podcast can be launched on a user's own stack.

## Using Pico

The intent is to make Pico free and open source, with guides on deploying it to a simple VPS (virtual private server) provided by Linode, DigitalOcean or the like. I don't see the need to go down the road of making this a distributed, cloud-enabled app. If that ends up being a requirement, putting a CDN in front of the app is probably a better way to go.

Right now, there is no support provided for Pico. If you come across bugs, please raise an issue. You can also find @[radioburrito](https://twitter.com/radioburrito/) on Twitter.

Please don't install this if you're not technically minded. Not because anything is likely to explode, but because the project is at an embryonic stage and is only meant to be run in a limited number of places (locally on a Mac, and shortly via Docker container).

## License

You're free to use the project for any purpose, including commercially, for free. If you modify the source, you need to contribute it back to the community, ideally by forking this repo. You can't make derivative works from Pico that are not open source.
