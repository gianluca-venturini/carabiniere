import {queue} from 'async';
import * as _ from 'lodash';
import {MessageLevel} from './constants';
import {EmailParser} from './email_parser';
import {EmailServiceId, SERVICES} from './email_services/index';
import {log} from './log';
import {Report} from './report';
import {WebServer} from './web_server';

const report = new Report();
const emailParser = new EmailParser(report);

/** Instantiate all the email services */
const emailServices = _.keys(SERVICES).map((serviceName: EmailServiceId) => {
  const EmailService = SERVICES[serviceName];
  const service = new EmailService();
  const authUrl = service.getAuthUrl();
  log(authUrl, MessageLevel.INFO);
  service.listAllEmails(
    queue(async (message, callback) => {
      console.log(`Processing message ${message.id}`);
      await emailParser.parseEmailMessage(message);
      // Indicate that the work is finished
      callback();
    }, 10),
  );
  return service;
});

const webServer = new WebServer();
webServer.installEmailServicesCallbacks(emailServices);
webServer.listen();
