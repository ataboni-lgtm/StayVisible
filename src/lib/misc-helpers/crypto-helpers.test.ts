describe('crypto helpers', () => {
  const originalKey = process.env.ENCRYPTION_KEY;

  afterEach(() => {
    vi.resetModules();
    if (originalKey === undefined) {
      delete process.env.ENCRYPTION_KEY;
    } else {
      process.env.ENCRYPTION_KEY = originalKey;
    }
  });

  it('throws during import when the encryption key is missing or invalid', async () => {
    delete process.env.ENCRYPTION_KEY;

    await expect(
      import('@/lib/misc-helpers/crypto-helpers')
    ).rejects.toThrow('ENCRYPTION_KEY not found or not of length 64 in hex format.');
  });

  it('encrypts and decrypts strings with a valid key', async () => {
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    const { decryptString, encryptString } = await import(
      '@/lib/misc-helpers/crypto-helpers'
    );

    const encrypted = encryptString('super-secret');

    expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/);
    expect(decryptString(encrypted)).toBe('super-secret');
  });

  it('rejects malformed encrypted payloads', async () => {
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    const { decryptString } = await import('@/lib/misc-helpers/crypto-helpers');

    expect(() => decryptString('invalid')).toThrow('Invalid encrypted string format.');
  });
});
