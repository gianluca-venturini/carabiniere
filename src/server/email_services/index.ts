import {GmailEmailService} from './gmail';
import {EmailService} from './types';

export const SERVICES: {[serviceName: string]: new () => EmailService} = {
  gmail: GmailEmailService,
};
