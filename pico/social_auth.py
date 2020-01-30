import os


FACEBOOK = {
    'APP': {
        'client_id': os.getenv('FACEBOOK_CLIENT_ID'),
        'secret': os.getenv('FACEBOOK_SECRET')
    }
}

GOOGLE = {
    'APP': {
        'client_id': os.getenv('FACEBOOK_CLIENT_ID'),
        'secret': os.getenv('FACEBOOK_SECRET')
    }
}

LINKEDIN = {
    'APP': {
        'client_id': os.getenv('LINKEDIN_CLIENT_ID'),
        'secret': os.getenv('LINKEDIN_SECRET')
    }
}

TWITTER = {
    'APP': {
        'client_id': os.getenv('TWITTER_CLIENT_ID'),
        'secret': os.getenv('TWITTER_SECRET')
    }
}
