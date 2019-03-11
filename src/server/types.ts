import {gmail_v1} from 'googleapis';
import {EmailServiceId} from './email_services';

// TODO: generalize this format in order to be compatible with multiple services
export type EmailMessage = gmail_v1.Schema$Message;

export interface EmailMetadata {
  emailServiceId: EmailServiceId;
  emailId: string;
  from?: string;
  to?: string;
  subject?: string;
  date?: Date;
}

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
