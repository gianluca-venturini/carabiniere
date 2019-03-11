import {ENDPOINTS} from './constants';
import {FlaggedEmailsResponse} from './types';

export const fetchFlaggedEmails = async (): Promise<FlaggedEmailsResponse> => {
  const reponse = await fetch(ENDPOINTS.FLAGGED_MESSAGES);
  if (reponse.status !== 200) {
    throw Error('Failed to fetch flagged emails');
  }
  const {messages} = await reponse.json();
  return {
    messages: messages.map((message: any) => {
      const {date, ...rest} = message;
      return {
        ...rest,
        date: new Date(date),
      };
    }),
  } as FlaggedEmailsResponse;
  // return {
  //   messages: [
  //     {
  //       emailId: '123',
  //       emailServiceId: EmailServiceId.GMAIL,
  //       from: 'from@gmail.com',
  //       to: 'to@gmail.com',
  //       subject: 'This is the subject',
  //       flags: [],
  //       date: new Date(),
  //     },
  //   ],
  // };
};
