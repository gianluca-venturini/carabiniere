import {queue} from 'async';
import * as _ from 'lodash';
import {MessageLevel} from './constants';
import {SERVICES} from './email_services/index';
import {log} from './log';
import {WebServer} from './web_server';

/** Instantiate all the email services */
const emailServices = _.keys(SERVICES).map((serviceName) => {
  const EmailService = SERVICES[serviceName];
  const service = new EmailService();
  const authUrl = service.getAuthUrl();
  log(authUrl, MessageLevel.INFO);
  service.listAllEmails(
    queue((message, callback) => {
      console.log(`Processing message ${message.id}`);
      setTimeout(callback, 1);
    }, 10),
  );
  return service;
});

const webServer = new WebServer();
webServer.installEmailServicesCallbacks(emailServices);
webServer.listen();
