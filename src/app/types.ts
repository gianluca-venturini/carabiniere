import {EmailFlag, FlagExtra} from '../server/email_flagger/type';
import {EmailServiceId} from '../server/email_services';

export interface Message {
  emailId: string;
  emailServiceId: EmailServiceId;
  from?: string;
  to?: string;
  subject?: string;
  flags: ReadonlyArray<{flag: EmailFlag; extra: FlagExtra}>;
  date?: Date;
}

/**
 * Endpoint types for maintiaing type safety between server and app
 */

export interface FlaggedEmailsResponse {
  messages: ReadonlyArray<Message>;
}

export interface StatsResponse {
  processedEmails: number;
  fetchedEmails: number;
  discoveredEmails: number;
  flaggedEmails: number;
  fetchingPages: boolean;
  totalMessages: number | undefined;
}
