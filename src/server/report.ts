import * as assert from 'assert';
import * as _ from 'lodash';
import {FlaggedEmailsResponse, StatsResponse} from '../app/types';
import {EmailFlag, FlagExtra} from './email_flagger/type';
import {EmailMetadata} from './types';

interface FlaggedEmail extends EmailMetadata {
  flags: Map<EmailFlag, FlagExtra | undefined>;
}

/**
 * Class in charge of keeping track of flagged emails.
 */
export class Report {
  private flaggedEmails: {[serviceMessageId: string]: FlaggedEmail} = {};
  private stats: StatsResponse = {
    processedEmails: 0,
    fetchedEmails: 0,
    discoveredEmails: 0,
    flaggedEmails: 0,
    totalMessages: undefined,
    fetchingPages: false,
  };

  /**
   * Used for tagging an email with a specific flag.
   * If this function is called multiple times on the same email with the same
   * flag the extra args will be overwritten.
   */
  flagEmail = (email: EmailMetadata, flag: EmailFlag, extra?: FlagExtra) => {
    const flaggedEmail = this.getOrCreateFlaggedEmail(email);
    flaggedEmail.flags.set(flag, extra);
  }

  /**
   * Generate a serializable array of flagged emails
   */
  getAllFlaggedEmails = (): FlaggedEmailsResponse => {
    const messages = _.values(this.flaggedEmails).map((flaggedEmail) => ({
      ...flaggedEmail,
      // Converting from set of strings to array
      flags: Array.from(flaggedEmail.flags.keys()).map((emailFlag) => ({
        flag: emailFlag,
        extra: flaggedEmail.flags.get(emailFlag),
      })),
    }));
    return {messages};
  }

  increaseProcessedEmails = (num = 1) => {
    assert(num > 0);
    this.stats.processedEmails += num;
  }

  increaseFetchedEmails = (num = 1) => {
    assert(num > 0);
    this.stats.fetchedEmails += num;
  }

  increaseDiscovereEmails = (num = 1) => {
    assert(num > 0);
    this.stats.discoveredEmails += num;
  }

  increaseFlaggedEmails = (num = 1) => {
    assert(num > 0);
    this.stats.flaggedEmails += num;
  }

  startFetchingPages = () => {
    this.stats.fetchingPages = true;
  }

  stopFetchingPages = () => {
    this.stats.fetchingPages = false;
  }

  setTotalMessages = (totalMessages: number) => {
    this.stats.totalMessages = totalMessages;
  }

  getStats = (): StatsResponse => {
    return {...this.stats};
  }

  private getOrCreateFlaggedEmail = (email: EmailMetadata) => {
    const key = this.getEmailKey(email.emailServiceId, email.emailId);
    if (this.flaggedEmails[key] === undefined) {
      this.increaseFlaggedEmails();
      this.flaggedEmails[key] = {
        ...email,
        flags: new Map<EmailFlag, FlagExtra | undefined>(),
      };
    }
    return this.flaggedEmails[key];
  }

  private getEmailKey = (emailServiceId: string, emailId: string) => {
    return `${emailServiceId}:${emailId}`;
  }
}
