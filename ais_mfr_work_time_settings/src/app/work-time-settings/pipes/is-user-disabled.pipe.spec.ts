import { IsUserDisabledPipe } from './is-user-disabled.pipe';

describe('IsUserDisabledPipe', () => {
  it('create an instance', () => {
    const pipe = new IsUserDisabledPipe();
    expect(pipe).toBeTruthy();
  });
});
