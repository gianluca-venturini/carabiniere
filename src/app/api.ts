import {ENDPOINTS} from './constants';
import {FlaggedEmailsResponse, StatsResponse} from './types';

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
};

export const fetchStats = async (): Promise<StatsResponse> => {
  const reponse = await fetch(ENDPOINTS.STATS);
  if (reponse.status !== 200) {
    throw Error('Failed to fetch flagged emails');
  }
  return reponse.json();
};
