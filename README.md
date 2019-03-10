## Configuration steps

1. Obtain Google api credentials at `https://console.developers.google.com`.
2. Configure the OAuth callback at `https://console.developers.google.com/apis/credentials?project=<PROJECT_NAME>`.
   Add `http://127.0.0.1/oauth_callback_google` for enabling callbacks on localhost.

## Configuration variables

For development and test purposes you can create a `.env` file in root directory
and place the values there. Otherwise the value in your ENV will be used.

- GOOGLE_CLIENT_ID: Google client id
- GOOGLE_CLIENT_SECRET: Google client secret

## Features

- Scan all the elements in a Gmail inbox.
- Detects unprotected attachments on emails. Flags every time of attachment.
- Detects unprotected Dropbox links that are still active. Ignores inactive links.
