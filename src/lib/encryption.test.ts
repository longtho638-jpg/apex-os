import { describe, expect, it } from 'vitest';
import { decrypt, encrypt } from './encryption';

describe('Encryption Utility', () => {
  it('encrypts and decrypts a string correctly', () => {
    const originalText = 'super-secret-api-key';
    const encrypted = encrypt(originalText);

    expect(encrypted).not.toBe(originalText);
    expect(encrypted).toContain(':'); // Should contain IV separator

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(originalText);
  });

  it('returns original text if empty', () => {
    expect(encrypt('')).toBe('');
    expect(decrypt('')).toBe('');
  });

  it('handles special characters', () => {
    const text = 'Key!@#$%^&*()_+{}|:"<>?';
    const encrypted = encrypt(text);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(text);
  });

  it('produces different outputs for same input (random IV)', () => {
    const text = 'same-text';
    const enc1 = encrypt(text);
    const enc2 = encrypt(text);

    expect(enc1).not.toBe(enc2);
    expect(decrypt(enc1)).toBe(text);
    expect(decrypt(enc2)).toBe(text);
  });

  it('returns original text if format is invalid (not encrypted)', () => {
    const plainText = 'not-encrypted-text';
    // decrypt expects "iv:content" format
    expect(decrypt(plainText)).toBe(plainText);
  });
});
