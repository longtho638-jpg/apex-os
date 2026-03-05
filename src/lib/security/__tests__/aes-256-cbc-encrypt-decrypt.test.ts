import { describe, expect, it, vi } from 'vitest';

// Must set env var before module is imported (key read at module load time)
vi.stubEnv('APP_SECRET_KEY', 'abcdefghijklmnopqrstuvwxyz012345'); // exactly 32 bytes

// Import after stubbing so the module picks up the correct key
const { encrypt, decrypt } = await import('../crypto');

describe('crypto - encrypt/decrypt', () => {
  it('returns format iv_hex:ciphertext_hex', () => {
    const result = encrypt('hello');
    const parts = result.split(':');
    expect(parts.length).toBe(2);
    expect(parts[0]).toMatch(/^[0-9a-f]{32}$/i); // 16 bytes = 32 hex chars
    expect(parts[1]).toMatch(/^[0-9a-f]+$/i);
  });

  it('decrypt reverses encrypt', () => {
    const original = 'secret data 123';
    expect(decrypt(encrypt(original))).toBe(original);
  });

  it('different inputs produce different ciphertexts', () => {
    expect(encrypt('foo')).not.toBe(encrypt('bar'));
  });

  it('encrypt produces different IV each call (random)', () => {
    const a = encrypt('same text');
    const b = encrypt('same text');
    expect(a.split(':')[0]).not.toBe(b.split(':')[0]);
  });

  it('handles empty string', () => {
    expect(decrypt(encrypt(''))).toBe('');
  });

  it('handles special characters and unicode', () => {
    const special = 'héllo wörld 🔐 <script>&</script>';
    expect(decrypt(encrypt(special))).toBe(special);
  });

  it('handles long text', () => {
    const long = 'A'.repeat(1000);
    expect(decrypt(encrypt(long))).toBe(long);
  });
});
