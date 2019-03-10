import {AsyncQueue, queue} from 'async';
import {gmail_v1, google} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_OAUTH_CALLBACK,
  GOOGLE_OAUTH_REDIRECT_URL,
  GOOGLE_OAUTH_TOKEN,
  MessageLevel,
} from '../constants';
import {log} from '../log';
import {EmailService} from './types';

const SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
];
const MAX_PAGE_FETCH_ATTEMPTS = 3;
const MESSAGE_FETCH_WORKERS = 100;

export class GmailEmailService implements EmailService {
  public OAUTH_CALLBACK = GOOGLE_OAUTH_CALLBACK;

  private oauthClient: OAuth2Client;

  constructor() {
    this.oauthClient = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_OAUTH_REDIRECT_URL,
    );
    // Used for rapid prototyping purposes
    if (GOOGLE_OAUTH_TOKEN !== undefined) {
      this.oauthClient.setCredentials({access_token: GOOGLE_OAUTH_TOKEN});
      log('Successfully set credentials');
    }
  }

  getAuthUrl() {
    const authUrl = this.oauthClient.generateAuthUrl({
      // Get refresh token
      access_type: 'offline',
      scope: SCOPES,
    });
    return authUrl;
  }

  async registerOauthCode(code: string) {
    const {tokens} = await this.oauthClient.getToken(code);
    this.oauthClient.setCredentials(tokens);
    log(`Successfully generated auth token: ${tokens.access_token}`);
  }

  /**
   * Inserts all emails present in the mailbox in the queue pausing
   * when the queue is saturated in order to avoid exceeding available memory.
   */
  listAllEmails(asyncQueue: AsyncQueue<gmail_v1.Schema$Message>) {
    return new Promise<void>((resolve) => {
      log('Start listing emails');
      const gmail = google.gmail({version: 'v1', auth: this.oauthClient});
      // Queue used for fetching the next message
      const messageQueue = queue<gmail_v1.Schema$Message>(
        async (messageMetadata, done) => {
          let attempts = 0;
          while (attempts < MAX_PAGE_FETCH_ATTEMPTS) {
            try {
              const message = await this.fetchEmail(gmail, messageMetadata.id);
              log(`Successfully fetched message ${message.id}`);
              asyncQueue.push(message);
              done();
              break;
            } catch (err) {
              log(
                `Error in fetching message ${messageMetadata.id} ${err}`,
                MessageLevel.WARNING,
              );
              attempts += 1;
            }
          }
          if (attempts >= MAX_PAGE_FETCH_ATTEMPTS) {
            throw Error(
              `Max attempts exceeded for message ${messageMetadata.id}`,
            );
          }
        },
        MESSAGE_FETCH_WORKERS,
      );

      const listEmailState: {
        allPagesExplored: boolean;
        pageToken?: string;
        queueSaturated: boolean;
        fetchPageInProgress: boolean;
      } = {
        allPagesExplored: false,
        queueSaturated: asyncQueue.length() - asyncQueue.buffer > 0,
        fetchPageInProgress: false,
      };

      const listPages = async () => {
        log(
          `Start listing pages, queue buffer ${
            asyncQueue.buffer
          }, elements in queue: ${asyncQueue.length()}`,
        );
        while (
          listEmailState.allPagesExplored === false &&
          listEmailState.queueSaturated === false
        ) {
          listEmailState.fetchPageInProgress = true;
          let attempts = 0;
          while (attempts < MAX_PAGE_FETCH_ATTEMPTS) {
            try {
              const data = await this.listEmailIdsInPage(
                gmail,
                listEmailState.pageToken,
              );
              const {messages, nextPageToken} = data;
              log(
                `Fetched ${messages.length} from page ${
                  listEmailState.pageToken
                }`,
              );
              messageQueue.push(messages);
              if (nextPageToken === undefined) {
                log('All pages explored');
                listEmailState.allPagesExplored = true;
                // After the internal message queue is completely empty we can resolve the promise
                messageQueue.drain = resolve;
              } else {
                listEmailState.pageToken = nextPageToken;
              }
              break;
            } catch (err) {
              log(
                `Error in fetching page ${listEmailState.pageToken} ${err}`,
                MessageLevel.WARNING,
              );
              attempts += 1;
            }
          }

          if (attempts >= MAX_PAGE_FETCH_ATTEMPTS) {
            throw Error('Impossible to complete the operation');
          }
          listEmailState.fetchPageInProgress = false;
        }
      };

      asyncQueue.saturated = () => {
        messageQueue.pause();
      };

      asyncQueue.unsaturated = () => {
        messageQueue.resume();
      };

      messageQueue.saturated = () => {
        log(
          `Fetch message queue is saturated [${asyncQueue.length()}]. Pausing list pages`,
        );
        listEmailState.queueSaturated = true;
      };

      messageQueue.unsaturated = () => {
        log('Fetch message queue is unsaturated');
        listEmailState.queueSaturated = false;
        if (listEmailState.fetchPageInProgress === false) {
          listPages();
        }
      };

      listPages();
    });
  }

  private async listEmailIdsInPage(gmail: gmail_v1.Gmail, pageToken?: string) {
    const response = await gmail.users.messages.list({userId: 'me', pageToken});
    if (response.status !== 200) {
      throw new Error(response.statusText);
    } else {
      return response.data;
    }
  }

  private async fetchEmail(gmail: gmail_v1.Gmail, messageId: string) {
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });
    if (response.status !== 200) {
      throw new Error(response.statusText);
    } else {
      return response.data;
    }
  }
}
