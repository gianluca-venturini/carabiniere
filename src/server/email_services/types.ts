import {AsyncQueue} from 'async';
import {Report} from '../report';
import {EmailMessage} from '../types';

export interface EmailService {
  OAUTH_CALLBACK: string;
  getAuthUrl: () => string;
  getTotalMessages: () => Promise<number>;
  registerOauthCode: (code: string) => void;
  listAllEmails: (asyncQueue: AsyncQueue<EmailMessage>) => Promise<void>;
}
