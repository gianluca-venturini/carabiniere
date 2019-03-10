import async = require('async');
import {google} from 'googleapis';
import {GmailEmailService} from './gmail';

describe('OAuth flow', () => {
  beforeEach(() => {
    jest.mock('googleapis');
  });

  it('Generate auth url', () => {
    const service = new GmailEmailService();
    const authUrl = service.getAuthUrl();
    expect(authUrl).toBe('test_url');
  });
});

/**
 * Mock return messages from a page of a three pages mailbox
 */
function getPage(pageToken?: string) {
  if (pageToken === undefined) {
    return {
      messages: [{id: '1'}, {id: '2'}, {id: '3'}],
      nextPageToken: '1',
    };
  }
  if (pageToken === '1') {
    return {
      messages: [{id: '4'}, {id: '5'}, {id: '6'}],
      nextPageToken: '2',
    };
  }
  if (pageToken === '2') {
    return {
      messages: [{id: '7'}, {id: '8'}, {id: '9'}],
      nextPageToken: undefined,
    };
  }
}

const mockGet = jest.fn(() => {
  return Promise.resolve({
    status: 200,
    data: {},
  });
});

describe('List all emails flow', () => {
  beforeEach(() => {
    jest.mock('googleapis');
  });

  it('List 3 emails in 1 page, no concurrency', (done) => {
    const service = new GmailEmailService();
    const state = {
      processedMessaged: 0,
    };
    const asyncQueue = async.queue((message, callback) => {
      console.log(`processing message ${state.processedMessaged}`);
      state.processedMessaged += 1;
      async.nextTick(callback);

      if (state.processedMessaged === 3) {
        done();
      }
    }, 1);
    service.listAllEmails(asyncQueue);
  });

  it('List 9 emails in 3 pages, no concurrency', (done) => {
    const service = new GmailEmailService();
    const state = {
      processedMessaged: 0,
    };
    const asyncQueue = async.queue((message, callback) => {
      state.processedMessaged += 1;
      async.nextTick(callback);

      if (state.processedMessaged === 9) {
        done();
      }
    }, 1);

    google.gmail = jest.fn(
      () =>
        ({
          users: {
            messages: {
              list: jest.fn(({pageToken}: {pageToken: string}) =>
                Promise.resolve({
                  status: 200,
                  data: getPage(pageToken),
                }),
              ),
              get: mockGet,
            },
          },
        } as any),
    );

    jest.mock('googleapis');
    service.listAllEmails(asyncQueue);
  });

  it('List 9 emails in 3 pages, concurrency 2', (done) => {
    const service = new GmailEmailService();
    const state = {
      processedMessaged: 0,
    };
    const asyncQueue = async.queue((message, callback) => {
      state.processedMessaged += 1;
      async.nextTick(callback);

      if (state.processedMessaged === 9) {
        done();
      }
    }, 2);

    google.gmail = jest.fn(
      () =>
        ({
          users: {
            messages: {
              list: jest.fn(({pageToken}: {pageToken: string}) =>
                Promise.resolve({
                  status: 200,
                  data: getPage(pageToken),
                }),
              ),
              get: mockGet,
            },
          },
        } as any),
    );

    jest.mock('googleapis');
    service.listAllEmails(asyncQueue);
  });

  it('List 3 emails in 1 page, no concurrency, 2 attempts', (done) => {
    const service = new GmailEmailService();
    const state = {
      processedMessaged: 0,
      status: 500, // First attempt will result in error
    };
    const asyncQueue = async.queue((message, callback) => {
      state.processedMessaged += 1;
      async.nextTick(callback);

      if (state.processedMessaged === 3) {
        done();
      }
    }, 2);

    google.gmail = jest.fn(
      () =>
        ({
          users: {
            messages: {
              list: jest.fn(() => {
                const currentStatus = state.status;
                state.status = 200; // Next time will succeed
                return Promise.resolve({
                  status: currentStatus,
                  data: {
                    messages: [{id: '1'}, {id: '2'}, {id: '3'}],
                  },
                });
              }),
              get: mockGet,
            },
          },
        } as any),
    );

    jest.mock('googleapis');
    service.listAllEmails(asyncQueue);
  });
});
