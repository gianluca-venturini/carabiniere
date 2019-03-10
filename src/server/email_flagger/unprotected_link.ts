import {AsyncQueue, queue} from 'async';
import {gmail_v1} from 'googleapis';
import * as _ from 'lodash';
import {log} from '../log';
import {EmailMessage} from '../types';
import {EmailFlagger} from './type';
import {UNSECURED_LINK_SERVICES} from './unsecured_link_service/index';
import {UnsecuredLinkService} from './unsecured_link_service/types';

interface Flags {
  containsLink: boolean;
}

const LINK_CHECK_WORKERS = 2;

export class UnprotectedLink implements EmailFlagger {
  private unprotectedLinkServices: ReadonlyArray<UnsecuredLinkService>;

  constructor() {
    this.unprotectedLinkServices = _.values(UNSECURED_LINK_SERVICES).map(
      (UnsecuredLinkServiceClass) => new UnsecuredLinkServiceClass(),
    );
  }

  isEmailFlagged(message: EmailMessage) {
    log(`Checking message ${message.id} for unprotected links`);
    const flags: Flags = {
      containsLink: false,
    };
    const asyncQueue = queue<gmail_v1.Schema$MessagePart>(
      async (part, done) => {
        await this.inspectPart(part, flags, asyncQueue);
        done();
      },
    );
    asyncQueue.push(message.payload);
    return new Promise<{flagged: boolean}>((resolve) => {
      asyncQueue.drain = () => {
        if (flags.containsLink) {
          log('Found link');
          resolve({flagged: true});
        } else {
          resolve({flagged: false});
        }
      };
    });
  }

  private async inspectPart(
    part: gmail_v1.Schema$MessagePart,
    flags: Flags,
    asyncQueue: AsyncQueue<gmail_v1.Schema$MessagePart>,
  ) {
    log(`Inspect part ${part.partId}`);
    // Looks for files attached to the email
    if (part.body.data) {
      const plainText = Buffer.from(part.body.data, 'base64').toString();
      this.unprotectedLinkServices.forEach(async (service) => {
        const matches = plainText.match(service.matchLink);
        if (matches === null) {
          return;
        }
        // Necessary to use a queue here in order to limit the number of
        // concurrently open connections in case a email part contains a lot of links
        const checkUnsecureLinkQueue = queue<string>((url) => {
          return service.isLinkUnsecure(url).then((result: boolean) => {
            if (result) {
              flags.containsLink = true;
            }
          });
        }, LINK_CHECK_WORKERS);
        checkUnsecureLinkQueue.push(matches);
        // Resolve the promise only after all the links are checked
        return new Promise((resolve) => {
          checkUnsecureLinkQueue.drain = resolve;
        });
      });
    }
    if (part.parts) {
      // Queue all the new discovered parts
      part.parts.forEach((newPart) => {
        asyncQueue.push(newPart);
      });
    }
  }
}
