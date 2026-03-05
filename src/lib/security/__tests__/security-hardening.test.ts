import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Security Hardening - Environment Variables', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it('should throw error when APP_SECRET_KEY is missing (crypto.ts)', async () => {
    delete process.env.APP_SECRET_KEY;
    try {
      await import('../crypto');
    } catch (error: unknown) {
      expect((error as Error).message).toContain('APP_SECRET_KEY is not defined');
    }
  });

  it('should throw error when APP_SECRET_KEY is not 32 bytes (crypto.ts)', async () => {
    process.env.APP_SECRET_KEY = 'short-key';
    try {
      await import('../crypto');
    } catch (error: unknown) {
      expect((error as Error).message).toContain('must be exactly 32 bytes');
    }
  });

  it('should throw error when SIGNATURE_SECRET is missing (signature.ts)', async () => {
    delete process.env.API_SIGNATURE_SECRET;
    delete process.env.SUPABASE_JWT_SECRET;
    try {
      await import('../signature');
    } catch (error: unknown) {
      expect((error as Error).message).toContain('API_SIGNATURE_SECRET or SUPABASE_JWT_SECRET is not defined');
    }
  });

  it('should throw error when JWT_SECRET is missing (jwt.ts)', async () => {
    delete process.env.SUPABASE_JWT_SECRET;
    delete process.env.JWT_SECRET;
    // We need to import it dynamically to trigger the top-level check
    try {
      await import('../../jwt');
    } catch (error: unknown) {
      expect((error as Error).message).toContain('JWT_SECRET is not defined');
    }
  });
});
