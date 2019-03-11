import * as assert from 'assert';
import * as _ from 'lodash';
import {FlaggedEmailsResponse} from '../app/types';
import {EmailFlag} from './email_flagger/type';
import {EmailMetadata} from './types';

interface FlaggedEmail extends EmailMetadata {
  flags: Set<EmailFlag>;
}

/**
 * Class in charge of keeping track of flagged emails.
 */
export class Report {
  private flaggedEmails: {[serviceMessageId: string]: FlaggedEmail} = {};
  private stats = {
    processedEmails: 0,
    fetchedEmails: 0,
    discoveredEmails: 0,
    fetchingPages: true,
  };

  flagEmail(email: EmailMetadata, flag: EmailFlag) {
    const flaggedEmail = this.getOrCreateFlaggedEmail(email);
    flaggedEmail.flags.add(flag);
  }

  /**
   * Generate a serializable array of flagged emails
   */
  getAllFlaggedEmails(): FlaggedEmailsResponse {
    const messages = _.values(this.flaggedEmails).map((flaggedEmail) => ({
      ...flaggedEmail,
      // Converting from set of strings to array
      flags: Array.from(flaggedEmail.flags),
    }));
    return {messages};
  }

  increaseProcessedEmails(num = 1) {
    assert(num > 0);
    this.stats.processedEmails += num;
  }

  increaseFetchedEmails(num = 1) {
    assert(num > 0);
    this.stats.fetchedEmails += num;
  }

  increaseDiscovereEmails(num = 1) {
    assert(num > 0);
    this.stats.discoveredEmails += num;
  }

  stopFetchingPages() {
    this.stats.fetchingPages = false;
  }

  getStats() {
    return {...this.stats};
  }

  private getOrCreateFlaggedEmail(email: EmailMetadata) {
    const key = this.getEmailKey(email.emailServiceId, email.emailId);
    if (this.flaggedEmails[key] === undefined) {
      this.flaggedEmails[key] = {
        ...email,
        flags: new Set(),
      };
    }
    return this.flaggedEmails[key];
  }

  private getEmailKey(emailServiceId: string, emailId: string) {
    return `${emailServiceId}:${emailId}`;
  }
}
