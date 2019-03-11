import {EMAIL_FLAGGER} from './email_flagger';
import {EmailFlag, EmailFlagger} from './email_flagger/type';
import {EmailServiceId} from './email_services';
import {log} from './log';
import {Report} from './report';
import {EmailMessage, EmailMetadata, Omit} from './types';

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
      {
        emailFlagger: new EMAIL_FLAGGER[EmailFlag.UNPROTECTED_LINK](),
        emailFlag: EmailFlag.UNPROTECTED_LINK,
      },
    ];
  }

  /**
   * Parse the email message attempting to flag email using all the methods contained
   * in email_flag/ path. If an email is flagged, it's automatically added to the report.
   */
  async parseEmailMessage(message: EmailMessage) {
    log(`Parse message ${message.id}`);
    const flaggerPromises = this.emailFlaggers.map(
      async ({emailFlagger, emailFlag}) => {
        const result = await emailFlagger.isEmailFlagged(message);
        console.log('HERE', emailFlag, result);
        if (result.flagged) {
          log(`Flagged email ${message.id} with ${emailFlag}`);
          const email = {
            // TODO: remove the hardcoded service and replace with actual one
            emailServiceId: EmailServiceId.GMAIL,
            emailId: message.id,
            date: new Date(parseInt(message.internalDate, 10)),
            ...this.getEmailInfo(message),
          };
          this.report.flagEmail(email, emailFlag, result.extra);
        }
      },
    );
    // Terminate the returned promise only when all the flaggers are done
    return Promise.all(flaggerPromises);
  }

  getEmailInfo(message: EmailMessage) {
    const emailMetadata: Omit<
      Omit<EmailMetadata, 'emailServiceId'>,
      'emailId'
    > = {};
    message.payload.headers.forEach((header) => {
      if (header.name === 'From') {
        emailMetadata.from = header.value;
      }
      if (header.name === 'To') {
        emailMetadata.to = header.value;
      }
      if (header.name === 'Subject') {
        emailMetadata.subject = header.value;
      }
    });
    return emailMetadata;
  }
}
