import * as express from 'express';
import * as http from 'http';
import * as _ from 'lodash';
import * as urlParse from 'url-parse';
import {INTERNAL_PORT} from './constants';
import {EmailService} from './email_services/types';
import {log} from './log';

export class WebServer {
  private app: express.Express;
  private server: http.Server;

  constructor() {
    this.app = express();
  }

  /**
   * Install OAuth callbacks needed for receiving the code and build the auth token.
   */
  installEmailServicesCallbacks(
    emailServices: EmailService[],
    connectServiceCallback: () => void,
  ) {
    emailServices.forEach((emailService) => {
      log(`Installing ${emailService.OAUTH_CALLBACK} callback`);
      this.app.get(`/${emailService.OAUTH_CALLBACK}`, async (req, res) => {
        const parsedUrl = urlParse(req.url, true);
        const code = parsedUrl.query['code'];
        await emailService.registerOauthCode(code);

        res.write('Authenticated successfully');
        // TODO: enable this after fetching redirection url and opening different tab
        // res.write('<script>window.close();</script>');
        res.end();
        connectServiceCallback();
      });
    });
  }

  /**
   * Listen on internal port
   */
  listen() {
    this.server = http.createServer(this.app);
    this.server.listen(INTERNAL_PORT);
  }
}
