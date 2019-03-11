import {gmail_v1} from 'googleapis';
import {log} from '../log';
import {EmailMessage} from '../types';
import {EmailFlagger} from './type';

interface Flags {
  attachementNames: string[];
}

const EXTENSION_WHITELIST = new Set([
  // Files without extensions are embedded in the HTML of the email and can be
  // safely ignored
  '',
  // Google calendar invite
  'ics',
]);

export class UnprotectedFile implements EmailFlagger {
  isEmailFlagged(message: EmailMessage) {
    log(`Checking message ${message.id} for unprotected attachments`);
    const flags: Flags = {
      attachementNames: [],
    };
    this.inspectPart(message.payload, flags);
    if (flags.attachementNames.length > 0) {
      log('Found attachment');
      return Promise.resolve({
        flagged: true,
        extra: {
          attachementNames: flags.attachementNames.join(', '),
        },
      });
    } else {
      return Promise.resolve({flagged: false});
    }
  }

  private inspectPart(part: gmail_v1.Schema$MessagePart, flags: Flags) {
    // Looks for file attached to the email
    if (part.filename && !isExtensionWhitelisted(part.filename)) {
      // Log the name of the file
      flags.attachementNames.push(part.filename);
    }
    if (part.parts) {
      part.parts.forEach((newPart) => {
        this.inspectPart(newPart, flags);
      });
    }
  }
}

export function isExtensionWhitelisted(filename: string) {
  const matched = filename.match(/[^\.]+\.([a-zA-Z]+)$/);
  const extension = (matched && matched[1]) || '';
  return EXTENSION_WHITELIST.has(extension);
}
