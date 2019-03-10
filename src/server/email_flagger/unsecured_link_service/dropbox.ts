import fetch from 'node-fetch';
import {UnsecuredLinkService} from './types';

export class DropboxService implements UnsecuredLinkService {
  matchLink = /https:\/\/www.dropbox.com\/[^ ]+/g;

  async isLinkUnsecure(url: string) {
    const matchedPrefix = url.match(/^[^\?]+/g);
    if (matchedPrefix !== null) {
      try {
        // Try to fetch the file. We only verefy that the file exists, we don't download it.
        const result = await fetch(matchedPrefix + '?dl=1', {size: 0});
        if (result.status === 200) {
          return Promise.resolve(true);
        } else {
          // The file is not active anymore
          return Promise.resolve(false);
        }
      } catch {
        // The file doesn't exist
        return Promise.resolve(false);
      }
    }
    return Promise.resolve(false);
  }
}