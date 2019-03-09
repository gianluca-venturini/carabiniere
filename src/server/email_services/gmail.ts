import {google} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_OAUTH_REDIRECT_URL,
} from '../constants';
import {EmailService} from './types';

const SCOPES = ['https://mail.google.com/'];

export class GmailEmailService implements EmailService {
  public OAUTH_CALLBACK = GOOGLE_OAUTH_REDIRECT_URL;

  private oauthClient: OAuth2Client;

  constructor() {
    this.oauthClient = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_OAUTH_REDIRECT_URL,
    );
  }

  getAuthUrl() {
    const authUrl = this.oauthClient.generateAuthUrl({
      // Get refresh token
      access_type: 'offline',
      scope: SCOPES,
    });
    return authUrl;
  }

  async registerOauthCode(code: string) {
    const {tokens} = await this.oauthClient.getToken(code);
    this.oauthClient.setCredentials(tokens);
  }
}
