# Configuring Pico

If `python manage.py runserver` is working as expected, the next thing to do is configure the authentication backend. Pico allows users to login via Facebook, Google, LinkedIn and Twitter. You can extend the project yourself to include anything supported by [django-allauth](https://django-allauth.readthedocs.io/en/latest/), but we felt like these were the most useful and most common options for clients.

## Storing app credentials

App IDs and secrets should never be shared. If you're forking the Pico project to run it yourself, don't commit your social app IDs and secrets; instead, create an environment variable file (or use your PaaS manager) to store these credentials.

### Storing credentials for local development

If running locally, you'll need to update your `.env` file with a number of values. If you're using the `.env` convention that starts each line with `export `, you should end up with a file that looks like this:

```sh
source bin/activate
export SECRET_KEY=MWYkOCQrZHk5dTNrNmR4JWIxIT1jKzZqbndrY2NfcSsoKXB5YXRzYjZuNysoOTg5JSE=
export DEBUG=1

export FACEBOOK_CLIENT_ID=foo
export FACEBOOK_SECRET=bar

export GOOGLE_CLIENT_ID=foo
export GOOGLE_SECRET=bar

export LINKEDIN_CLIENT_ID_CLIENT_ID=foo
export LINKEDIN_SECRET=bar

export TWITTER_CLIENT_ID=foo
export TWITTER_SECRET=bar
```

The `.env` file is ignored by Git, so any changes you make to this file won't be committed to your repo. If you need to sync or share these settings, you should figure out a way to do that securely.

## The social authentication flow

OAuth flow works like this:

1. The Pico user selects the platform they want to authenticate with.
2. They are redirected to that service (eg Facebook).
3. They login with their Facebook account, nad grant Pico access to it.
4. They are redirected to a Pico redirect URI.

You need to determine your redirect URI, as you'll need this for most OAuth providers (the sites that your users authenticate against). Usually you'll have two instances of your application, one for development or testing, and another for production (the live version that your clients see). You need separate credentials for each instance, because the redirect URI will be different.

For example, when running locally, the redirect URI for Facebook is `http://localhost:8000/accounts/facebook/login/callback/`. Now let's say you're running a live version at `pico.example.com`. In that instance, your redirect URI is likely to be `https://pico.example.com/accounts/facebook/login/callback/`. Remember the domain name and the final part of the URL, as those are the two bits that will change, the last one changing depending on the service. (LinkedIn has a slight exception to this rule, which we'll get to in that section.)

## Setting up Facebook

1. Login to <https://developers.facebook.com> with your Facebook account.
2. From the "My apps" menu, select "Create app".
3. Call your app "Pico" (if you like).
4. Click "Create app ID" (you might be asked to solve a CAPTCHA).
5. In the app dashboard, select "Settings" then "Basic".
6. Note down the "App ID".
7. Click the "Show" button next to "App secret" (you might be asked to enter your Facebook password), and note down the value.
8. Set the following environment variables:

```
FACEBOOK_CLIENT_ID=<your app id>
FACEBOOK_SECRET=<your app secret>
```

(Remember to add `export ` to the beginning of each of these lines, if your `.env` file uses that convention).

## Setting up Google

1. Login to <https://console.developers.google.com/apis/credentials> with your Google account.
2. If you've used the console before, you might need to select or create a new project. If not (or you don't have any projects), you may be prompted to create a new project. Either way, once your project is created, select it from the dropdown next to the "Google APIs" logo.
3. Click "Create credentials", then "OAuth client ID".
4. Under "Application type", choose "Web application".
5. Give your credential set a name. If you're just creating an app to test locally, you might call it "Test" or "Development". Otherwise, use a name like "Production".
6. Under "Authorised redirect URIs", enter the URL listed in the above "social authentication flow" section. For example, `http://localhost:8000/accounts/google/login/callback/`.
6. Click "Create".
7. Take note of the "Client ID" and "Client secret" values.
8. Set the following environment variables:

```
GOOGLE_CLIENT_ID=<your client id>
GOOGLE_SECRET=<your client secret>
```

(Remember to add `export ` to the beginning of each of these lines, if your `.env` file uses that convention).

If, during the process, you're prompted to set information about the OAuth consent screen, follow those instructions, especially if you want to enable anyone with a Google account to access your Pico installation (as opposed to you only, or members of your G Suite organisation).

## Configuring LinkedIn

1. Login to <https://www.linkedin.com/developers/apps/new/> with your LinkedIn account.
2. Give your app a name (like "Pico") and add or select your company name.
3. Upload the icon found in _assets/icon@512w.png_ (or your own, if you prefer).
4. Read and accept their legal terms.
5. Click "Create app".
6. From the app dashboard, click the "Auth" tab.
7. Click the pencil icon next to the "Redirect URLs" label in the "OAuth 2.0 settings" section.
8. Click "Add redirect URL".
9. Enter the URL listed in the above "social authentication flow" section. For example, `http://localhost:8000/accounts/linkedin_oauth2/login/callback/`.
10. Click "Update".
11. From the "Application credentials" section, note down the "Client ID" value.
12. Click the eye icon next to the "Client secret" box and note down the value.
13. Set the following environment variables:

```
LINKEDIN_CLIENT_ID=<your client id>
LINKEDIN_SECRET=<your client secret>
```

(Remember to add `export ` to the beginning of each of these lines, if your `.env` file uses that convention).

### A note about your redirect URI:

`django-allauth` uses the name `linkedin_oauth2` in its URLs for authenticating with LinkedIn. That means your callback URI will contain `/linkedin_oauth2/`, not `/linkedin/` like the other providers.

## Configuring Twitter

1. Login to <https://developer.twitter.com/en/apps/> with your Twitter account.
2. Click "Create an app".
3. Give your app a name. (This must be unique, so consider something like "Pico, by My Company" or just "My Company's Project Manager".)
4. Enter a description of the app. You'll find an example description below.
5. For the "Website URL", enter the URL your Pico installation will live at, once live (for example: https://pico.example.com/). The installation need not be live, yet. It just can't be a `localhost` URL.
6. Tick the "Enable sign in with Twitter" box.
7. Under "Callback URLs", enter the URL listed in the above "social authentication flow" section. For example, `http://localhost:8000/accounts/twitter/login/callback/`.
8. For the required "Tell us how this app will be used" text, use the example below, in the "How Pico uses Twitter" section.
9. Review the developer terms.
10. Click "Create".
11. From the app dashboard, click the "Keys and tokens" tab.
12. Note down the "API key" value.
13. Note down the "API secret key" value.
14. Set the following environment variables:

```
TWITTER_CLIENT_ID=<your api key>
TWITTER_SECRET=<your api secret key>
```

(Remember to add `export ` to the beginning of each of these lines, if your `.env` file uses that convention).

### Example app description

> Pico is a project management app for podcast producers and talent. It lets you plan and manage upcoming podcast episodes, and supply audio for your producer to edit.

### How Pico uses Twitter

> Twitter accounts are used to authenticate with the Pico service only. There are no plans to tweet on users' behalves, alter who they follow, or read their timelines. It is simply a way for users to sign up with Pico, without storing a password with us.
