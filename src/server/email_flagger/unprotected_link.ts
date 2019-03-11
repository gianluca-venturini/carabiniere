import {AsyncQueue, queue} from 'async';
import {gmail_v1} from 'googleapis';
import * as _ from 'lodash';
import {log} from '../log';
import {EmailMessage} from '../types';
import {EmailFlagger, FlagResult} from './type';
import {UNSECURED_LINK_SERVICES} from './unsecured_link_service/index';
import {UnsecuredLinkService} from './unsecured_link_service/types';

interface Flags {
  unsecureLink: string[];
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
      unsecureLink: [],
    };
    const asyncQueue = queue<gmail_v1.Schema$MessagePart>((part, done) => {
      this.inspectPart(part, flags, asyncQueue).then(() => done());
    });
    asyncQueue.push(message.payload);
    return new Promise<FlagResult>((resolve) => {
      asyncQueue.drain = () => {
        log('Message checked for links');
        if (flags.unsecureLink.length > 0) {
          log('Found link');
          resolve({
            flagged: true,
            extra: {
              usecureLinkOnService: flags.unsecureLink.join(', '),
            },
          });
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
      const linkServicesInspectionPromises = this.unprotectedLinkServices.map(
        async (service) => {
          const matches = plainText.match(service.matchLink);
          if (matches === null) {
            return;
          }
          // Necessary to use a queue here in order to limit the number of
          // concurrently open connections in case a email part contains a lot of links
          const checkUnsecureLinkQueue = queue<string>((url, done) => {
            log(`Checking if link is still alive ${url}`);
            service.isLinkUnsecure(url).then((result: boolean) => {
              if (result) {
                log(`The link ${url} is still alive`);
                flags.unsecureLink.push(service.name);
              } else {
                log(`The link ${url} is dead, not sensitive`);
              }
              done();
            });
          }, LINK_CHECK_WORKERS);
          checkUnsecureLinkQueue.push(matches);
          // Resolve the promise only after all the links are checked
          return new Promise((resolve) => {
            checkUnsecureLinkQueue.drain = () => {
              log('Checked all the links of this part');
              resolve();
            };
          });
        },
      );
      await Promise.all(linkServicesInspectionPromises);
    }
    if (part.parts) {
      // Queue all the new discovered parts
      part.parts.forEach((newPart) => {
        asyncQueue.push(newPart);
      });
    }
  }
}
