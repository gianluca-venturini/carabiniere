export interface EmailService {
  OAUTH_CALLBACK: string;
  getAuthUrl: () => string;
  registerOauthCode: (code: string) => void;
}
