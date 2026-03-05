import { NextRequest, NextResponse } from 'next/server';
import { describe, expect, it, vi } from 'vitest';
import { logger } from '@/lib/logger';
import { middleware } from '../middleware';

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';
process.env.SUPABASE_JWT_SECRET = 'mock-jwt-secret';

// Mock Supabase Client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  }),
}));

// Mock jose for JWT verification
vi.mock('jose', () => ({
  jwtVerify: vi.fn().mockImplementation(async (token, _secret) => {
    if (token === 'valid-token') {
      return { payload: { sub: 'user-123', role: 'authenticated' } };
    }
    if (token === 'admin-token') {
      return { payload: { sub: 'admin-123', role: 'admin' } };
    }
    throw new Error('Invalid Token');
  }),
}));

// Mock next-intl/middleware
vi.mock('next-intl/middleware', () => ({
  default: () => (_req: any) => NextResponse.next(),
}));

// Mock middleware dependencies to avoid env var issues
vi.mock('@/middleware/rateLimit', () => ({
  applyRateLimit: vi.fn().mockResolvedValue(null),
}));
vi.mock('@/middleware/signature', () => ({
  validateRequestSignature: vi.fn().mockReturnValue(true),
}));
vi.mock('@/middleware/csrf', () => ({
  handleCsrf: vi.fn().mockReturnValue(null),
  injectCsrfToken: vi.fn().mockImplementation((_req, res) => res),
}));
vi.mock('@/middleware/enterprise-auth', () => ({
  enterpriseAuthMiddleware: vi.fn().mockResolvedValue({ authorized: true }),
}));
vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

// Mock NextRequest and NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual<typeof import('next/server')>('next/server');
  return {
    ...actual,
    NextResponse: {
      json: (body: any, init?: any) => ({
        status: init?.status || 200,
        body,
        headers: new Map(),
      }),
      next: () => ({ status: 200, headers: new Map() }),
      redirect: (url: string) => ({ status: 307, headers: new Map(), url }),
      rewrite: (url: string) => ({ status: 200, headers: new Map(), url }),
    },
  };
});

describe('Security Middleware', () => {
  const createRequest = (path: string, headers: Record<string, string> = {}) => {
    const url = `http://localhost:3000${path}`;
    return new NextRequest(new URL(url), { headers: { host: 'localhost:3000', ...headers } });
  };

  it('should block unauthorized access to /api/admin', async () => {
    const req = createRequest('/api/v1/admin/users');
    const res = await middleware(req);

    logger.info('Response Status:', res.status);
    // Expect 401 JSON response
    expect(res.status).toBe(401);
    // We can't easily check body of NextResponse without reading stream, but status is enough
  });

  it('should block unauthorized access to protected API', async () => {
    const req = createRequest('/api/v1/trading/orders');
    const res = await middleware(req);
    expect(res.status).toBe(401);
  });

  it('should allow public API routes', async () => {
    const req = createRequest('/api/v1/public/status');
    const res = await middleware(req);
    // NextResponse.next() usually has status 200 (or undefined status in mock context implies pass)
    // In Next.js middleware, .next() returns a response with a specific internal header or just passes.
    // We check if it's NOT 401/403/307
    expect(res.status).toBe(200);
  });

  it('should allow authorized access with Bearer token', async () => {
    const req = createRequest('/api/v1/trading/orders', {
      authorization: 'Bearer valid-token',
    });
    const res = await middleware(req);
    expect(res.status).toBe(200);
  });

  it('should block invalid token', async () => {
    const req = createRequest('/api/v1/trading/orders', {
      authorization: 'Bearer invalid-token',
    });
    const res = await middleware(req);
    expect(res.status).toBe(401);
  });

  it('should block non-admin user from accessing /api/admin', async () => {
    const req = createRequest('/api/v1/admin/users', {
      authorization: 'Bearer valid-token', // Role: authenticated (not admin)
    });
    const res = await middleware(req);
    // Expect 403 Forbidden or 401 Unauthorized depending on implementation
    expect([401, 403]).toContain(res.status);
  });
});
