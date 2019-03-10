import {UnprotectedFile} from './unprotected_file';

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
