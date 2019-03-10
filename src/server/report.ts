import * as assert from 'assert';
import * as _ from 'lodash';
import {EmailFlag} from './email_flagger/type';
import {EmailServiceId} from './email_services';

interface FlaggedEmail {
  emailServiceId: EmailServiceId;
  emailId: string;
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

  flagEmail(emailServiceId: EmailServiceId, emailId: string, flag: EmailFlag) {
    const flaggedEmail = this.getOrCreateFlaggedEmail(emailServiceId, emailId);
    flaggedEmail.flags.add(flag);
  }

  /**
   * Generate a serializable array of flagged emails
   */
  getAllFlaggedEmails() {
    return _.values(this.flaggedEmails).map((flaggedEmail) => ({
      ...flaggedEmail,
      // Converting from set of strings to array
      flags: Array.from(flaggedEmail.flags),
    }));
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

  private getOrCreateFlaggedEmail(
    emailServiceId: EmailServiceId,
    emailId: string,
  ) {
    const key = this.getEmailKey(emailServiceId, emailId);
    if (this.flaggedEmails[key] === undefined) {
      this.flaggedEmails[key] = {
        emailServiceId,
        emailId,
        flags: new Set(),
      };
    }
    return this.flaggedEmails[key];
  }

  private getEmailKey(emailServiceId: string, emailId: string) {
    return `${emailServiceId}:${emailId}`;
  }
}
