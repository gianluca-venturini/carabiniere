## Configuration steps

1. Obtain Google api credentials at `https://console.developers.google.com`.
2. Configure the OAuth callback at `https://console.developers.google.com/apis/credentials?project=<PROJECT_NAME>`.
   Add `http://127.0.0.1:<PORT>/oauth_callback_google` for enabling callbacks on localhost.

## Configuration variables

For development and test purposes you can create a `.env` file in root directory
and place the values there. Otherwise the value in your ENV will be used.

### Mandatory config parameters

- `GOOGLE_CLIENT_ID`: Google client id.
- `GOOGLE_CLIENT_SECRET`: Google client secret.

### Optional parameters

- `log_level`: The log verbosity `debug` | `info` | `warning` | `error`, default `debug`.
- `hostname`: The hostname where the app is running on. Default `127.0.0.1`. Necessary for OAuth callback.
- `port`: The internal port. Default `3000`.
- `external_port`: The reverse proxy port. Default is same as `port`. Necessary for OAuth callback.
- `ssl`: boolean value `true` or `false` indicating if the external port is running SSL. Default `false`.
- `GOOGLE_OAUTH_TOKEN`: If specified will use this token instead of fetching a new token with OAuth.

## Features

- Scan all the elements in a Gmail inbox.
- Detects unprotected attachments on emails. Flags every time of attachment.
- Detects unprotected Dropbox links that are still active. Ignores inactive links.

## Endpoints

- `/stats`: returns stats reguarding the current email processing.
- `/get_auth`: get the Gmail authentication link used for redirecting the user to the OAuth page.
- `/flagged_messages`: returns all the flagged messages.

## How to run the application

- Install npm packages
  `yarn install`
- Build the frontend
  `npm run build`
- Build the frontend watching for changes, useful while developing
  `npm run watch`
- Run the tests
  `npm run test`
- Start the application
  `npm start`
- Visit `http://<hostname>:<port>` to access the interface.

## Limitations

- Supports a single Gmail mailbox
- Query the entire mailbox once, doesn't listen for realitme updates
- Supports a single user at the same time using the app
- Doesn't support logout, it's necessary to restart the app to try a different mailbox
