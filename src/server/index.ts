import {queue} from 'async';
import * as _ from 'lodash';
import {MessageLevel} from './constants';
import {EmailParser} from './email_parser';
import {EmailServiceId, SERVICES} from './email_services/index';
import {log} from './log';
import {Report} from './report';
import {EmailMessage} from './types';
import {WebServer} from './web_server';

const EMAIL_PARSER_WORKERS = 1;

const report = new Report();
const emailParser = new EmailParser(report);

/**
 * Fetch all emails and fill the report with flagged emails.
 */
async function fillReport() {
  /** List all the emails contained in the all the services */
  const listAllEmailsPromises = emailServices.map((service) =>
    service.listAllEmails(parseEmailQueue),
  );
  await Promise.all(listAllEmailsPromises);
  log('All email services inspected');
  parseEmailQueue.drain = () => {
    console.log(JSON.stringify(report.getAllFlaggedEmails()));
  };
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

const webServer = new WebServer();
webServer.installEmailServicesCallbacks(emailServices, fillReport);
webServer.installReportViewer(report);
webServer.listen();
