import {AsyncQueue} from 'async';
import {gmail_v1} from 'googleapis';

export interface EmailService {
  OAUTH_CALLBACK: string;
  getAuthUrl: () => string;
  registerOauthCode: (code: string) => void;
  // TODO: generalize message format
  listAllEmails: (asyncQueue: AsyncQueue<gmail_v1.Schema$Message>) => void;
}
