import {queue} from 'async';
import * as _ from 'lodash';
import {MessageLevel} from './constants';
import {EmailParser} from './email_parser';
import {EmailServiceId, SERVICES} from './email_services/index';
import {log} from './log';
import {Report} from './report';
import {EmailMessage} from './types';
import {WebServer} from './web_server';

const EMAIL_PARSER_WORKERS = 10;

const report = new Report();
const emailParser = new EmailParser(report);

/**
 * Fetch all emails and fill the report with flagged emails.
 */
async function fillReport() {
  parseEmailQueue.drain = () => {
    log('All emails parsed');
    log(JSON.stringify(report.getAllFlaggedEmails()), MessageLevel.INFO);
  };

  /** List all the emails contained in the all the services */
  const listAllEmailsPromises = emailServices.map((service) =>
    service.listAllEmails(parseEmailQueue),
  );

  await Promise.all(listAllEmailsPromises);
  log('All email services inspected');
}

/** Instantiate all the email services */
const emailServices = _.keys(SERVICES).map((serviceName: EmailServiceId) => {
  const EmailService = SERVICES[serviceName];
  const service = new EmailService();
  const authUrl = service.getAuthUrl();
  log(authUrl, MessageLevel.INFO);
  return service;
});

/** Initialize the parser worker queue */
const parseEmailQueue = queue<EmailMessage>(async (message, callback) => {
  console.log(`Processing message ${message.id}`);
  await emailParser.parseEmailMessage(message);
  // Indicate that the work is finished
  callback();
}, EMAIL_PARSER_WORKERS);

fillReport();

const webServer = new WebServer();
webServer.installEmailServicesCallbacks(emailServices);
webServer.listen();
