import {EMAIL_FLAGGER} from './email_flagger';
import {EmailFlag, EmailFlagger} from './email_flagger/type';
import {EmailServiceId} from './email_services';
import {log} from './log';
import {Report} from './report';
import {EmailMessage} from './types';

export class EmailParser {
  private emailFlaggers: ReadonlyArray<{
    emailFlagger: EmailFlagger;
    emailFlag: EmailFlag;
  }>;

  constructor(private report: Report) {
    // Instantiate email flaggers in the specific order
    this.emailFlaggers = [
      {
        emailFlagger: new EMAIL_FLAGGER[EmailFlag.UNPROTECTED_FILE](),
        emailFlag: EmailFlag.UNPROTECTED_FILE,
      },
    ];
  }

  /**
   * Parse the email message attempting to flag email using all the methods contained
   * in email_flag path. If an email is flagged is automatically added to the report.
   */
  async parseEmailMessage(message: EmailMessage) {
    const flaggerPromises = this.emailFlaggers.map(
      async ({emailFlagger, emailFlag}) => {
        const result = await emailFlagger.isEmailFlagged(message);
        if (result.flagged) {
          log(`Flagged email ${message.id} with ${emailFlag}`);
          // TODO: remove the hardcoded service and replace with actual one
          this.report.flagEmail(EmailServiceId.GMAIL, message.id, emailFlag);
        }
      },
    );
    // Terminate the returned promise only when all the flaggers are done
    return Promise.all(flaggerPromises);
  }
}
