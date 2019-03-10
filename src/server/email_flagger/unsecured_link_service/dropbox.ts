import {UnsecuredLinkService} from './types';

export class DropboxService implements UnsecuredLinkService {
  matchLink = /https:\/\/www.dropbox.com\/[^ ]+/g;

  isLinkUnsecure(url: string) {
    return Promise.resolve(true);
  }
}
