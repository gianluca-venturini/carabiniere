import {EmailFlag, EmailFlagger} from './type';
import {UnprotectedFile} from './unprotected_file';

export const EMAIL_FLAGGER: {
  [emailFlag in EmailFlag]: new () => EmailFlagger
} = {
  [EmailFlag.UNPROTECTED_FILE]: UnprotectedFile,
};
