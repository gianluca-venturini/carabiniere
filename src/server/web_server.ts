import * as express from 'express';
import * as http from 'http';
import * as _ from 'lodash';
import * as urlParse from 'url-parse';
import {INTERNAL_PORT} from './constants';
import {EmailService} from './email_services/types';

export class WebServer {
  private app: express.Express;
  private server: http.Server;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
  }

  /**
   * Install OAuth callbacks needed for receiving the code and build the auth token.
   */
  installEmailServicesCallbacks(emailServices: EmailService[]) {
    emailServices.forEach((emailService) => {
      this.app.get(emailService.OAUTH_CALLBACK, (req) => {
        const parsedUrl = urlParse(req.url, true);
        const code = parsedUrl.query['code'];
        emailService.registerOauthCode(code);
      });
    });
  }

  /**
   * Listen on internal port
   */
  listen() {
    this.server.listen(INTERNAL_PORT);
  }
}
