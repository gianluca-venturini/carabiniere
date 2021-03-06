import {EmailMessage} from './../types';
export const enum EmailFlag {
  UNPROTECTED_FILE = 'unprotected_file',
  UNPROTECTED_LINK = 'unprotected_link',
}

export interface FlagResult {
  flagged: boolean;
  // Additional data that will be displayed in the UI
  extra?: FlagExtra;
}

export interface EmailFlagger {
  isEmailFlagged(message: EmailMessage): Promise<FlagResult>;
}
export interface FlagExtra {
  [key: string]: string;
}
