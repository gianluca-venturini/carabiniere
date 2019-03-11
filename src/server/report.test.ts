import * as _ from 'lodash';
import {EmailFlag} from './email_flagger/type';
import {EmailServiceId} from './email_services';
import {Report} from './report';

describe('Build a flagged emails report', () => {
  it('Add two emails to the report', () => {
    const report = new Report();
    report.flagEmail(
      {emailServiceId: EmailServiceId.GMAIL, emailId: 'id1'},
      EmailFlag.UNPROTECTED_FILE,
    );
    report.flagEmail(
      {emailServiceId: EmailServiceId.GMAIL, emailId: 'id2'},
      EmailFlag.UNPROTECTED_FILE,
    );
    expect(report.getAllFlaggedEmails()).toEqual({
      messages: [
        {
          emailId: 'id1',
          emailServiceId: EmailServiceId.GMAIL,
          flags: [{flag: EmailFlag.UNPROTECTED_FILE}],
        },
        {
          emailId: 'id2',
          emailServiceId: EmailServiceId.GMAIL,
          flags: [{flag: EmailFlag.UNPROTECTED_FILE}],
        },
      ],
    });
  });
});

describe('Build stats', () => {
  it('increase discovered emails', () => {
    const report = new Report();
    expect(report.getStats()).toEqual({
      processedEmails: 0,
      fetchedEmails: 0,
      discoveredEmails: 0,
      fetchingPages: true,
    });
    report.increaseDiscovereEmails();
    expect(report.getStats()).toEqual({
      processedEmails: 0,
      fetchedEmails: 0,
      discoveredEmails: 1,
      fetchingPages: true,
    });
    report.increaseDiscovereEmails(2);
    expect(report.getStats()).toEqual({
      processedEmails: 0,
      fetchedEmails: 0,
      discoveredEmails: 3,
      fetchingPages: true,
    });
  });

  it('increase fetched emails', () => {
    const report = new Report();
    expect(report.getStats()).toEqual({
      processedEmails: 0,
      fetchedEmails: 0,
      discoveredEmails: 0,
      fetchingPages: true,
    });
    report.increaseFetchedEmails();
    expect(report.getStats()).toEqual({
      processedEmails: 0,
      fetchedEmails: 1,
      discoveredEmails: 0,
      fetchingPages: true,
    });
    report.increaseFetchedEmails(2);
    expect(report.getStats()).toEqual({
      processedEmails: 0,
      fetchedEmails: 3,
      discoveredEmails: 0,
      fetchingPages: true,
    });
  });

  it('increase processed emails', () => {
    const report = new Report();
    expect(report.getStats()).toEqual({
      processedEmails: 0,
      fetchedEmails: 0,
      discoveredEmails: 0,
      fetchingPages: true,
    });
    report.increaseProcessedEmails();
    expect(report.getStats()).toEqual({
      processedEmails: 1,
      fetchedEmails: 0,
      discoveredEmails: 0,
      fetchingPages: true,
    });
    report.increaseProcessedEmails(2);
    expect(report.getStats()).toEqual({
      processedEmails: 3,
      fetchedEmails: 0,
      discoveredEmails: 0,
      fetchingPages: true,
    });
  });

  it('stop fetching pages', () => {
    const report = new Report();
    expect(report.getStats()).toEqual({
      processedEmails: 0,
      fetchedEmails: 0,
      discoveredEmails: 0,
      fetchingPages: true,
    });
    report.stopFetchingPages();
    expect(report.getStats()).toEqual({
      processedEmails: 0,
      fetchedEmails: 0,
      discoveredEmails: 0,
      fetchingPages: false,
    });
  });
});
