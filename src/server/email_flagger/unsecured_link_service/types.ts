export interface UnsecuredLinkService {
  // Name of the service in the UI
  name: string;
  // Every link that matches this regex will be passed to the service. Make the regex global.
  matchLink: RegExp;
  isLinkUnsecure: (url: string) => Promise<boolean>;
}
