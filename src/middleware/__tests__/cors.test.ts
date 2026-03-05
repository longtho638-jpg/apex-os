import { NextRequest, NextResponse } from 'next/server';
import { describe, expect, it } from 'vitest';
import { applyCors, handleOptionsRequest } from '../cors';

describe('CORS Middleware', () => {
  const createRequest = (origin: string | null, method: string = 'GET') => {
    return new NextRequest(new URL('http://localhost:3000'), {
      headers: origin ? { origin } : {},
      method,
    });
  };

  const createResponse = () => new NextResponse();

  describe('isOriginAllowed logic (via applyCors)', () => {
    it('allows exact matches from ALLOWED_ORIGINS', () => {
      const allowedOrigins = [
        'https://apexrebate.com',
        'https://www.apexrebate.com',
        'https://sophia-ai-factory.vercel.app',
        'http://localhost:3000',
        'https://telegram.org',
        'https://web.telegram.org',
      ];

      allowedOrigins.forEach((origin) => {
        const req = createRequest(origin);
        const res = createResponse();
        const result = applyCors(req, res);
        expect(result.headers.get('Access-Control-Allow-Origin')).toBe(origin);
      });
    });

    it('allows Vercel preview deployments', () => {
      const origin = 'https://some-preview-branch-longtho638-jpg.vercel.app';
      const req = createRequest(origin);
      const res = createResponse();
      const result = applyCors(req, res);
      expect(result.headers.get('Access-Control-Allow-Origin')).toBe(origin);
    });

    it('allows Telegram subdomains', () => {
      const origin = 'https://oauth.telegram.org';
      const req = createRequest(origin);
      const res = createResponse();
      const result = applyCors(req, res);
      expect(result.headers.get('Access-Control-Allow-Origin')).toBe(origin);
    });

    it('allows TradingView', () => {
      const origin = 'https://charting.tradingview.com';
      const req = createRequest(origin);
      const res = createResponse();
      const result = applyCors(req, res);
      expect(result.headers.get('Access-Control-Allow-Origin')).toBe(origin);
    });

    it('blocks disallowed origins', () => {
      const origin = 'https://evil.com';
      const req = createRequest(origin);
      const res = createResponse();
      const result = applyCors(req, res);
      expect(result.headers.get('Access-Control-Allow-Origin')).toBeNull();
    });

    it('ignores requests without origin header', () => {
      const req = createRequest(null);
      const res = createResponse();
      const result = applyCors(req, res);
      expect(result.headers.get('Access-Control-Allow-Origin')).toBeNull();
    });
  });

  describe('applyCors', () => {
    it('sets correct CORS headers for allowed origin', () => {
      const origin = 'https://apexrebate.com';
      const req = createRequest(origin);
      const res = createResponse();
      const result = applyCors(req, res);

      expect(result.headers.get('Access-Control-Allow-Origin')).toBe(origin);
      expect(result.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS, PATCH');
      expect(result.headers.get('Access-Control-Allow-Credentials')).toBe('true');
      expect(result.headers.get('Access-Control-Allow-Headers')).toContain('Authorization');
    });
  });

  describe('handleOptionsRequest', () => {
    it('returns 204 with CORS headers for allowed origin', () => {
      const origin = 'https://apexrebate.com';
      const req = createRequest(origin, 'OPTIONS');
      const result = handleOptionsRequest(req);

      expect(result.status).toBe(204);
      expect(result.headers.get('Access-Control-Allow-Origin')).toBe(origin);
      expect(result.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS, PATCH');
      expect(result.headers.get('Access-Control-Max-Age')).toBe('86400');
    });

    it('returns 204 without CORS headers for disallowed origin', () => {
      const origin = 'https://evil.com';
      const req = createRequest(origin, 'OPTIONS');
      const result = handleOptionsRequest(req);

      expect(result.status).toBe(204);
      expect(result.headers.get('Access-Control-Allow-Origin')).toBeNull();
    });

    it('returns 204 without CORS headers for missing origin', () => {
      const req = createRequest(null, 'OPTIONS');
      const result = handleOptionsRequest(req);

      expect(result.status).toBe(204);
      expect(result.headers.get('Access-Control-Allow-Origin')).toBeNull();
    });
  });
});
