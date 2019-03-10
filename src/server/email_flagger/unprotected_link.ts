import {gmail_v1} from 'googleapis';
import * as _ from 'lodash';
import {log} from '../log';
import {EmailMessage} from '../types';
import {EmailFlagger} from './type';
import {UNSECURED_LINK_SERVICES} from './unsecured_link_service/index';
import {UnsecuredLinkService} from './unsecured_link_service/types';

interface Flags {
  containsLink: boolean;
  explorationPromises: Array<Promise<void>>;
}

export class UnprotectedLink implements EmailFlagger {
  private unprotectedLinkServices: ReadonlyArray<UnsecuredLinkService>;

  constructor() {
    this.unprotectedLinkServices = _.values(UNSECURED_LINK_SERVICES).map(
      (UnsecuredLinkServiceClass) => new UnsecuredLinkServiceClass(),
    );
  }

  async isEmailFlagged(message: EmailMessage) {
    log(`Checking message ${message.id} for unprotected links`);
    const flags: Flags = {
      containsLink: false,
      explorationPromises: [],
    };
    this.inspectPart(message.payload, flags);
    await Promise.all(flags.explorationPromises);
    if (flags.containsLink) {
      log('Found link');
      return {flagged: true};
    } else {
      return {flagged: false};
    }
  }

  private inspectPart(part: gmail_v1.Schema$MessagePart, flags: Flags) {
    // Looks for file attached to the email
    if (part.body.data) {
      const plainText = Buffer.from(part.body.data, 'base64').toString();
      this.unprotectedLinkServices.forEach(async (service) => {
        const matches = plainText.match(service.matchLink);
        if (matches === null) {
          return;
        }
        matches.forEach((url) => {
          const checkedLinkPromise = service
            .isLinkUnsecure(url)
            .then((result: boolean) => {
              if (result) {
                flags.containsLink = true;
              }
            });
          flags.explorationPromises.push(checkedLinkPromise);
        });
      });
    }
    if (part.parts) {
      part.parts.forEach((newPart) => {
        this.inspectPart(newPart, flags);
      });
    }
  }
}
