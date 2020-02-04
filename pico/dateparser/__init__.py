from datetime import timedelta
from .exceptions import ParseError
import re


def parse(text):
    if text == 'now':
        return timedelta()

    match = re.match(r'^(-?\d+) ([a-zA-z]+)$', text)
    if match is not None:
        number, token = match.groups()

        if number == '1' and not token.endswith('s'):
            token += 's'

        try:
            td = timedelta(
                **{
                    token: int(number)
                }
            )
        except Exception as ex:
            raise ParseError('Invalid format') from ex

        return td

    raise ParseError('Invalid format')
