import {GoogleApis} from 'googleapis';

const googleapis = jest.genMockFromModule<GoogleApis>('googleapis');

googleapis.google = {
  auth: {
    OAuth2: class {
      generateAuthUrl = jest.fn(() => 'test_url');
      setCredentials = jest.fn();
      getToken = jest.fn(() => ({
        access_token: 'test_token',
      }));
      constructor() {}
    },
  },
  gmail: jest.fn(() => ({
    users: {
      messages: {
        list: jest.fn(() =>
          Promise.resolve({
            status: 200,
            data: {
              messages: [{id: '1'}, {id: '2'}, {id: '3'}],
            },
          }),
        ),
        get: jest.fn(() => {
          return Promise.resolve({
            status: 200,
            data: {},
          });
        }),
      },
    },
  })),
};

module.exports = googleapis;
