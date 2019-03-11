import {isExtensionWhitelisted, UnprotectedFile} from './unprotected_file';

describe('Unprotected files flagger', () => {
  it('flags email with file', async () => {
    const unprotectedFile = new UnprotectedFile();
    const result = await unprotectedFile.isEmailFlagged({
      payload: {
        filename: 'test.txt',
      },
    });
    expect(result.flagged).toBeTruthy();
  });

  it("doesn't flag email without file", async () => {
    const unprotectedFile = new UnprotectedFile();
    const result = await unprotectedFile.isEmailFlagged({
      payload: {},
    });
    expect(result.flagged).toBeFalsy();
  });
});

describe('Correctly classify extensions', () => {
  it('Extension not whitelisted', () => {
    expect(isExtensionWhitelisted('test.jpg')).toBeFalsy();
  });
  it('Extension whitelisted', () => {
    expect(isExtensionWhitelisted('test.ics')).toBeTruthy();
  });
  it('Empty is whitelisted', () => {
    expect(isExtensionWhitelisted('test')).toBeTruthy();
  });
  it('No extension', () => {
    expect(isExtensionWhitelisted('test..')).toBeTruthy();
  });
  it('Invalid filename', () => {
    expect(isExtensionWhitelisted('......')).toBeTruthy();
  });
  it('Invisible file without extension', () => {
    expect(isExtensionWhitelisted('.gitignore')).toBeTruthy();
  });
});
