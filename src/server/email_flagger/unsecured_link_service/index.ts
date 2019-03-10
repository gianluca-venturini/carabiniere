import {DropboxService} from './dropbox';
import {UnsecuredLinkService} from './types';

export const enum UNSECURED_LINK_SERVICE_ID {
  DROPBOX = 'dropbox',
}

export const UNSECURED_LINK_SERVICES: {
  [serviceId in UNSECURED_LINK_SERVICE_ID]: new () => UnsecuredLinkService
} = {
  [UNSECURED_LINK_SERVICE_ID.DROPBOX]: DropboxService,
};
