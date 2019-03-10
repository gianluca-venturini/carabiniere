import {EmailMessage} from '../types';
import {EmailFlagger} from './type';

export class UnprotectedFile implements EmailFlagger {
  isEmailFlagged(message: EmailMessage) {
    return Promise.resolve({flagged: false});
  }
}
