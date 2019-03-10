import {gmail_v1} from 'googleapis';
import {log} from '../log';
import {EmailMessage} from '../types';
import {EmailFlagger} from './type';

interface Flags {
  containsAttachment: boolean;
}

export class UnprotectedFile implements EmailFlagger {
  isEmailFlagged(message: EmailMessage) {
    log(`Checking message ${message.id} for unprotected attachments`);
    const flags = {
      containsAttachment: false,
    };
    this.inspectPart(message.payload, flags);
    if (flags.containsAttachment) {
      log('Found attachment');
      return Promise.resolve({flagged: true});
    } else {
      return Promise.resolve({flagged: false});
    }
  }

  private inspectPart(part: gmail_v1.Schema$MessagePart, flags: Flags) {
    // Looks for file attached to the email
    if (part.filename) {
      flags.containsAttachment = true;
    }
    if (part.parts) {
      part.parts.forEach((newPart) => {
        this.inspectPart(newPart, flags);
      });
    }
  }
}
