import * as express from 'express';
import * as http from 'http';
import * as _ from 'lodash';
import * as path from 'path';
import * as urlParse from 'url-parse';
import {ENDPOINTS} from '../app/constants';
import {INTERNAL_PORT} from './constants';
import {GmailEmailService} from './email_services/gmail';
import {EmailService} from './email_services/types';
import {log} from './log';
import {Report} from './report';

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

        res.write('<script>window.close();</script>');
        res.end();
        connectServiceCallback();
      });
      // TODO: get service name as a parameter
      this.app.get(ENDPOINTS.AUTH_URL, async (req, res) => {
        res.write(JSON.stringify({url: emailService.getAuthUrl()}));
        res.end();
      });
    });
  }

  /**
   * Makes the report instance available on REST APIs
   */
  installReportViewer(report: Report) {
    this.app.get(ENDPOINTS.STATS, async (req, res) => {
      res.write(JSON.stringify(report.getStats()));
      res.end();
    });
    this.app.get(ENDPOINTS.FLAGGED_MESSAGES, async (req, res) => {
      res.write(JSON.stringify(report.getAllFlaggedEmails()));
      res.end();
    });
  }

  /**
   * Listen on internal port
   */
  listen() {
    this.installPublicFiles();
    this.server = http.createServer(this.app);
    this.server.listen(INTERNAL_PORT);
  }

  private installPublicFiles() {
    this.app.use(express.static(path.join(__dirname, '../../dist')));
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
    });
  }
}
