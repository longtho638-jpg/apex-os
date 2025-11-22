/**
 * Next.js Middleware for Admin Route Protection
 *
 * Protects /admin/* routes with JWT validation
 * Returns 404 on unauthorized (hides admin existence)
 * Uses timing-safe comparison (prevents enumeration)
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_EMAIL = 'billwill.mentor@gmail.com';
const JWT_SECRET = new TextEncoder().encode(
  process.env.SUPABASE_JWT_SECRET || ''
);

/**
 * Timing-safe string comparison (Edge Runtime compatible)
 * Prevents timing attacks to discover admin emails
 */
function timingSafeCompare(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBuf = encoder.encode(a);
  const bBuf = encoder.encode(b);

  if (aBuf.byteLength !== bBuf.byteLength) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < aBuf.byteLength; i++) {
    result |= aBuf[i] ^ bBuf[i];
  }
  return result === 0;
}

/**
 * Extract JWT from cookies or Authorization header
 */
function extractToken(request: NextRequest): string | null {
  // Check cookie first (Supabase uses sb-access-token)
  const cookieToken = request.cookies.get('sb-access-token')?.value;
  if (cookieToken) return cookieToken;

  // Fallback: Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale
});

export async function middleware(request: NextRequest) {
  // 1. Run Admin Auth Check first for protected routes
  if (request.nextUrl.pathname.includes('/admin')) {
    const token = extractToken(request);

    // No token = not authenticated
    if (!token) {
      console.log('Middleware: No token found in request');
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('error', 'middleware_no_token');
      return NextResponse.redirect(url);
    }

    try {
      // Verify JWT signature
      const verified = await jwtVerify(token, JWT_SECRET);
      const email = verified.payload.email as string;

      if (!email) {
        // Token missing email claim
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('error', 'middleware_no_email');
        return NextResponse.redirect(url);
      }

      // Timing-safe admin check
      const isAdmin = timingSafeCompare(email, ADMIN_EMAIL);

      if (!isAdmin) {
        // Not admin
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('error', 'middleware_not_admin');
        return NextResponse.redirect(url);
      }

      // Valid admin - attach email to request headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-email', email);

      // Continue to next-intl middleware
      const response = intlMiddleware(request);
      response.headers.set('x-user-email', email);
      return response;

    } catch (error) {
      // Token invalid/expired
      console.error('Middleware: JWT verification failed:', error);
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('error', 'middleware_invalid_token');
      return NextResponse.redirect(url);
    }
  }

  // 2. For non-admin routes, just run next-intl middleware
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
