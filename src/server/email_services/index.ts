import {GmailEmailService} from './gmail';
import {EmailService} from './types';

export const enum EmailServiceId {
  GMAIL = 'gmail',
}

export const SERVICES: {
  [serviceName in EmailServiceId]: new () => EmailService
} = {
  [EmailServiceId.GMAIL]: GmailEmailService,
};
