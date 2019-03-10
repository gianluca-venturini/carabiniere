import {EmailFlag, EmailFlagger} from './type';
import {UnprotectedFile} from './unprotected_file';
import {UnprotectedLink} from './unprotected_link';

export const EMAIL_FLAGGER: {
  [emailFlag in EmailFlag]: new () => EmailFlagger
} = {
  [EmailFlag.UNPROTECTED_FILE]: UnprotectedFile,
  [EmailFlag.UNPROTECTED_LINK]: UnprotectedLink,
};
