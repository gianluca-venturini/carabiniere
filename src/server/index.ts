import {queue} from 'async';
import {exec} from 'child_process';
import * as _ from 'lodash';
import {EMAIL_PARSER_WORKERS, MessageLevel} from './constants';
import {EmailParser} from './email_parser';
import {EmailServiceId, SERVICES} from './email_services/index';
import {log} from './log';
import {Report} from './report';
import {EmailMessage} from './types';
import {WebServer} from './web_server';

const report = new Report();
const emailParser = new EmailParser(report);

/** Fetch all emails and fill the report with flagged emails */
async function fillReport() {
  report.startFetchingPages();
  /** List all the emails contained in the all the services */
  const listAllEmailsPromises = emailServices.map((service) => {
    service.getTotalMessages().then(report.setTotalMessages);
    return service.listAllEmails(parseEmailQueue);
  });
  await Promise.all(listAllEmailsPromises);
  log('All email services inspected', MessageLevel.INFO);
}

/** Instantiate all the email services */
const emailServices = _.keys(SERVICES).map((serviceName: EmailServiceId) => {
  const EmailService = SERVICES[serviceName];
  const service = new EmailService(report);
  const authUrl = service.getAuthUrl();
  log(authUrl, MessageLevel.INFO);
  return service;
});

/** Initialize the parser worker queue */
const parseEmailQueue = queue<EmailMessage>(async (message, callback) => {
  await emailParser.parseEmailMessage(message);
  report.increaseProcessedEmails();
  // Indicate that the work is finished
  callback();
}, EMAIL_PARSER_WORKERS);

/** Initialize the webserver connecting it to the report */
const webServer = new WebServer();
webServer.installEmailServicesCallbacks(emailServices, fillReport);
webServer.installReportViewer(report);
webServer.listen();
exec(`open ${webServer.getPublicUrl()}`);
