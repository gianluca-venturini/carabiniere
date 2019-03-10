import {log} from '../log';
import {EmailMessage} from '../types';
import {EmailFlagger} from './type';

export class UnprotectedFile implements EmailFlagger {
  isEmailFlagged(message: EmailMessage) {
    log(`Checking message ${message.id} for unprotected attachments`);
    return Promise.resolve({flagged: true});
  }
}
