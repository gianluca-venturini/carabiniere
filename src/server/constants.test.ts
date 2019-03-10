import {envConfig} from './constants';

describe('envConfig', () => {
  it('Add a variable that is specified by default', () => {
    expect(envConfig('foo', 'bar')).toBe('bar');
  });
  it('Add a variable that is specified by env', () => {
    process.env.foo = 'bar';
    expect(envConfig('foo')).toBe('bar');
    delete process.env.foo;
  });
  it('Add a variable that is specified by env and validate it - positive', () => {
    process.env.foo = 'bar';
    expect(envConfig('foo', '', ['bar'])).toBe('bar');
    delete process.env.foo;
  });
  it('Add a variable that is specified by env and validate it - negative', () => {
    process.env.foo = 'bar';
    const exitMock = jest.spyOn(process, 'exit');
    const errorMock = jest.spyOn(console, 'error');
    exitMock.mockImplementation(jest.fn() as any);
    errorMock.mockImplementation(jest.fn() as any);
    envConfig('foo', '', ['lol']);
    expect(exitMock).toBeCalled();
    expect(errorMock).toBeCalled();
    delete process.env.foo;
  });
  it('Add a non mandatory variable', () => {
    const warnMock = jest.spyOn(console, 'warn');
    expect(envConfig('foo', null)).toBe(undefined);
    expect(warnMock).not.toBeCalled();
  });
});
