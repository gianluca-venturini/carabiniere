import {log} from 'console';
import * as _ from 'lodash';
import {MessageLevel} from './constants';
import {SERVICES} from './email_services/index';
import {WebServer} from './web_server';

/** Instantiate all the email services */
const emailServices = _.keys(SERVICES).map((serviceName) => {
  const EmailService = SERVICES[serviceName];
  const service = new EmailService();
  const authUrl = service.getAuthUrl();
  log(authUrl, MessageLevel.INFO);
  return service;
});

const webServer = new WebServer();
webServer.installEmailServicesCallbacks(emailServices);
webServer.listen();
