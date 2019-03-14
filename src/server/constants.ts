import * as dotenv from 'dotenv';
// Load configuration from .env file if present
dotenv.config();

export enum MessageLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

// External hostname
const HOSTNAME = envConfig('hostname', '127.0.0.1');
// Port used on the proxy and is visible externally
const EXTERNAL_PORT = envConfig('external_port', '3000');
// Port used on the process
const INTERNAL_PORT = envConfig('port', EXTERNAL_PORT);
// Whether or not ssl is used on the proxy
const SSL = envConfig('ssl', 'false') === 'true';
const LOG_LEVEL = envConfig('log_level', 'debug', [
  'debug',
  'info',
  'warning',
  'error',
]) as MessageLevel;

/**
 * Gmail params
 */
const GOOGLE_CLIENT_ID = envConfig('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = envConfig('GOOGLE_CLIENT_SECRET');
// Variable used for testing purposes only
const GOOGLE_OAUTH_TOKEN = envConfig('GOOGLE_OAUTH_TOKEN', null);

/**
 * Get variable from env.
 * If not present in env attempt to get it from default value.
 * If default value not present terminate the process with an error.
 * If the value doesn't match allowed values then an error is raised.
 */
export function envConfig(
  envName: string,
  // If the default value is null the variable is not mandatory
  defaultValue?: string | null,
  allowedValues?: ReadonlyArray<string>,
): string {
  const envValue = process.env[envName];
  if (envValue !== undefined) {
    if (allowedValues !== undefined) {
      // Validate the value
      if (allowedValues.indexOf(envValue) !== -1) {
        return envValue;
      } else {
        console.error(
          `Value ${envValue} not allowed for ${envName}. Values: ${allowedValues.join(
            ',',
          )}`,
        );
        process.exit(1);
      }
    } else {
      return envValue;
    }
  }
  if (defaultValue === null) {
    return undefined;
  }
  if (defaultValue !== undefined) {
    console.warn(`Using default value [${envName}]: ${defaultValue}`);
    return defaultValue;
  } else {
    console.error(`Required variable ${envName} not present in env`);
    process.exit(1);
  }
}

const PROTOCOL = SSL ? 'https' : 'http';
const GOOGLE_OAUTH_CALLBACK = 'oauth_callback_google';
const GOOGLE_OAUTH_REDIRECT_URL = `${PROTOCOL}://${HOSTNAME}:${EXTERNAL_PORT}/${GOOGLE_OAUTH_CALLBACK}`;

const EMAIL_PARSER_WORKERS = 20;

export {
  HOSTNAME,
  INTERNAL_PORT,
  EXTERNAL_PORT,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_OAUTH_CALLBACK,
  GOOGLE_OAUTH_REDIRECT_URL,
  GOOGLE_OAUTH_TOKEN,
  LOG_LEVEL,
  PROTOCOL,
  EMAIL_PARSER_WORKERS,
};
