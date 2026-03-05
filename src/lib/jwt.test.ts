import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('JWT Utilities', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('SUPABASE_JWT_SECRET', 'test-secret');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('generates and verifies a valid session token', async () => {
    const { generateSessionToken, verifySessionToken } = await import('./jwt');
    const token = generateSessionToken('test@example.com', 'admin', 'user-123');
    const decoded = verifySessionToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.email).toBe('test@example.com');
    expect(decoded?.role).toBe('admin');
    expect(decoded?.sub).toBe('user-123');
  });

  it('returns null for invalid tokens', async () => {
    const { verifySessionToken } = await import('./jwt');
    const result = verifySessionToken('invalid.token.here');
    expect(result).toBeNull();
  });

  it('returns null for expired tokens', async () => {
    // Mock jwt.verify to throw TokenExpiredError
    vi.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('jwt expired');
    });

    const { verifySessionToken } = await import('./jwt');
    const result = verifySessionToken('expired.token');
    expect(result).toBeNull();
  });

  it('enforces SUPABASE_JWT_SECRET presence in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SUPABASE_JWT_SECRET', '');
    vi.stubEnv('JWT_SECRET', '');
    // We need to delete them effectively. stubEnv with '' might not trigger the "undefined" check if check is `!env`.
    // If logic is `if (!process.env.SECRET)`, empty string triggers it.
    // But if it checks `=== undefined`, we might need `vi.unstubEnv` or something else.
    // Let's see the logic in jwt.ts. Usually it is `!process.env.X`.

    // We expect the module import to throw
    await expect(import('./jwt')).rejects.toThrow('FATAL: SUPABASE_JWT_SECRET is not defined');
  });

  it('warns but allows missing secret in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('SUPABASE_JWT_SECRET', '');
    vi.stubEnv('JWT_SECRET', '');

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await import('./jwt');

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('SUPABASE_JWT_SECRET'));
  });
});
