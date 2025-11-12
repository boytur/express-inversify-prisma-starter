import { CryptoService } from '../../utils/crypto.service';

describe('CryptoService', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV, JWT_SECRET: 'test-secret' };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('signs and verifies a payload', () => {
    const service = new CryptoService();
    const token = service.sign({ id: '123', email: 'a@b.com' }, { expiresIn: '1h' });
    expect(typeof token).toBe('string');

    const payload = service.verify(token);
    expect(payload).toHaveProperty('id', '123');
    expect(payload).toHaveProperty('email', 'a@b.com');
  });

  it('throws on invalid token', () => {
    const service = new CryptoService();
    expect(() => service.verify('invalid.token.here')).toThrow();
  });
});
