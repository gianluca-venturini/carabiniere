import {EmailServiceId} from '../server/email_services';
import {FlaggedEmailsResponse, Message} from './types';

export const fetchFlaggedEmails = async (): Promise<FlaggedEmailsResponse> => {
  // return fetch(ENDPOINTS.FLAGGED_MESSAGES);
  return {
    messages: [
      {
        emailId: '123',
        emailServiceId: EmailServiceId.GMAIL,
        from: 'from@gmail.com',
        to: 'to@gmail.com',
        subject: 'This is the subject',
        flags: [],
        date: new Date(),
      },
    ],
  };
};
