import { describe, expect, it } from 'vitest';
import { generateSignature, verifySignature } from '../signature';

describe('signature - generateSignature / verifySignature', () => {
  it('generateSignature returns signature and timestamp strings', () => {
    const { signature, timestamp } = generateSignature('POST', '/api/v1/trade');
    expect(typeof signature).toBe('string');
    expect(signature).toMatch(/^[0-9a-f]{64}$/i); // sha256 hex = 64 chars
    expect(typeof timestamp).toBe('string');
    expect(Number(timestamp)).toBeGreaterThan(0);
  });

  it('verifySignature returns true for a valid generated signature', () => {
    const { signature, timestamp } = generateSignature('POST', '/api/v1/trade', 'body');
    expect(verifySignature('POST', '/api/v1/trade', timestamp, signature, 'body')).toBe(true);
  });

  it('verifySignature returns false when signature is tampered', () => {
    const { timestamp } = generateSignature('POST', '/api/v1/trade');
    expect(verifySignature('POST', '/api/v1/trade', timestamp, 'deadbeef'.repeat(8))).toBe(false);
  });

  it('verifySignature returns false for expired timestamp (>30s)', () => {
    const { signature } = generateSignature('GET', '/api/v1/ping');
    const oldTs = (Date.now() - 31000).toString();
    expect(verifySignature('GET', '/api/v1/ping', oldTs, signature)).toBe(false);
  });

  it('verifySignature returns false for NaN timestamp', () => {
    const { signature } = generateSignature('GET', '/api/v1/ping');
    expect(verifySignature('GET', '/api/v1/ping', 'not-a-number', signature)).toBe(false);
  });

  it('full roundtrip with body succeeds', () => {
    const body = JSON.stringify({ amount: 100, asset: 'USDT' });
    const { signature, timestamp } = generateSignature('PUT', '/api/v1/order', body);
    expect(verifySignature('PUT', '/api/v1/order', timestamp, signature, body)).toBe(true);
  });

  it('different HTTP methods produce different signatures', () => {
    const ts = Date.now().toString();
    const sigGet = generateSignature('GET', '/api/v1/test').signature;
    const sigPost = generateSignature('POST', '/api/v1/test').signature;
    expect(sigGet).not.toBe(sigPost);
  });

  it('body content affects signature', () => {
    const { signature: s1 } = generateSignature('POST', '/api/v1/trade', 'body1');
    const { signature: s2 } = generateSignature('POST', '/api/v1/trade', 'body2');
    expect(s1).not.toBe(s2);
  });
});
