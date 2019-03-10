import {AsyncQueue} from 'async';
import {EmailMessage} from '../types';

export interface EmailService {
  OAUTH_CALLBACK: string;
  getAuthUrl: () => string;
  registerOauthCode: (code: string) => void;
  listAllEmails: (asyncQueue: AsyncQueue<EmailMessage>) => void;
}
