import * as _ from 'lodash';
import {EmailFlag} from './email_flag/type';
import {EmailServiceId} from './email_services';
import {Report} from './report';

describe('Build a report', () => {
  it('Add two emails to the report', () => {
    const report = new Report();
    report.flagEmail(EmailServiceId.GMAIL, 'id1', EmailFlag.UNPROTECTED_FILE);
    report.flagEmail(EmailServiceId.GMAIL, 'id2', EmailFlag.UNPROTECTED_FILE);
    expect(report.getAllFlaggedEmails()).toEqual([
      {
        emailId: 'id1',
        emailServiceId: EmailServiceId.GMAIL,
        flags: [EmailFlag.UNPROTECTED_FILE],
      },
      {
        emailId: 'id2',
        emailServiceId: EmailServiceId.GMAIL,
        flags: [EmailFlag.UNPROTECTED_FILE],
      },
    ]);
  });
});
