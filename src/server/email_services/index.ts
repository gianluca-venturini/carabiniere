import {Report} from '../report';
import {GmailEmailService} from './gmail';
import {EmailService} from './types';

export const enum EmailServiceId {
  GMAIL = 'gmail',
}

export const SERVICES: {
  [serviceName in EmailServiceId]: new (report: Report) => EmailService
} = {
  [EmailServiceId.GMAIL]: GmailEmailService,
};
