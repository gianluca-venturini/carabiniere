import {EmailMessage} from './../types';
export const enum EmailFlag {
  UNPROTECTED_FILE = 'unprotected_file',
  UNPROTECTED_LINK = 'unprotected_link',
}

export interface FlagResult {
  flagged: boolean;
}

export interface EmailFlagger {
  isEmailFlagged(message: EmailMessage): Promise<FlagResult>;
}
