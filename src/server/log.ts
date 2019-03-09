import * as _ from 'lodash';
import {LOG_LEVEL, MessageLevel} from './constants';

// Describes the verbosity of every level
const LEVELS: {[level in MessageLevel]: ReadonlyArray<MessageLevel>} = {
  [MessageLevel.DEBUG]: [
    MessageLevel.DEBUG,
    MessageLevel.INFO,
    MessageLevel.WARNING,
    MessageLevel.ERROR,
  ],
  [MessageLevel.INFO]: [
    MessageLevel.INFO,
    MessageLevel.WARNING,
    MessageLevel.ERROR,
  ],
  [MessageLevel.WARNING]: [MessageLevel.WARNING, MessageLevel.ERROR],
  [MessageLevel.ERROR]: [MessageLevel.ERROR],
};

/**
 * Logs debug messges in console
 */
export function log(message: string, level: MessageLevel = MessageLevel.DEBUG) {
  if (LEVELS[LOG_LEVEL].indexOf(MessageLevel.INFO) === -1) {
    return;
  }

  switch (level) {
    case MessageLevel.DEBUG:
      console.log(message);
      break;
    case MessageLevel.INFO:
      console.log(message);
      break;
    case MessageLevel.WARNING:
      console.warn(message);
      break;
    case MessageLevel.DEBUG:
      console.error(message);
      break;
  }
}
