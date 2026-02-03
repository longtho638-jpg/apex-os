import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';
import { applyRateLimit } from '@/middleware/rateLimit';
import { validateRequestSignature } from '@/middleware/signature';
import { handleCsrf, injectCsrfToken } from '@/middleware/csrf';
import { enterpriseAuthMiddleware } from '@/middleware/enterprise-auth';
import { logger } from '@/lib/logger';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const JWT_SECRET = new TextEncoder().encode(
  process.env.SUPABASE_JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Initialize next-intl middleware
const locales = ['en', 'vi', 'th', 'id', 'ko', 'ja', 'zh'];
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always'
});

export async function middleware(request: NextRequest) {
  // Strip port from hostname for reliable comparison
  const hostname = (request.headers.get('host') || '').split(':')[0];

  // 0. Multi-Tenancy Routing
  // Check if it's a custom domain or subdomain
  // Exclude main domain (e.g. apexrebate.com or localhost:3000)
  // Also exclude Vercel preview domains to ensure they get i18n
  const isMainDomain =
    hostname === 'apexrebate.com' ||
    hostname === 'www.apexrebate.com' ||
    hostname.includes('vercel.app') || // Treat vercel.app as main domain for testing
    hostname.includes('localhost');

  const isCustomDomain = !isMainDomain;

  if (isCustomDomain) {
    // Ideally fetch tenant from DB/Cache based on hostname
    // For CLI demo, we assume subdomain maps to tenant slug
    const subdomain = hostname.split('.')[0];

    // Rewrite to /_sites/[site]
    // But since we are using next-intl, we need to be careful.
    // Next.js middleware rewrite:
    const url = request.nextUrl.clone();
    url.pathname = `/_sites/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // 1. Global Rate Limiting (API Only)
  if (request.nextUrl.pathname.startsWith('/api')) {
    const rateLimitResponse = await applyRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;
  }

  // 2. Enterprise API Authentication (with Session Fallback for Dashboard)
  if (request.nextUrl.pathname.startsWith('/api/v1/signals')) {

    // Check for session cookie first (Internal Dashboard Access)
    let token = request.cookies.get('apex_session')?.value ||
      request.cookies.get('sb-access-token')?.value ||
      request.cookies.get(`sb-${process.env.NEXT_PUBLIC_SUPABASE_REFERENCE_ID}-auth-token`)?.value;

    let isSessionValid = false;
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        isSessionValid = true;
      } catch (e) {
        // Token invalid, proceed to API Key check
      }
    }

    if (!isSessionValid) {
      const enterpriseCheck = await enterpriseAuthMiddleware(request);
      if (!enterpriseCheck.authorized) {
        return NextResponse.json({ error: enterpriseCheck.error }, { status: 401 });
      }
    }
  }

  // 3. CSRF Protection (Mutation API Only)
  const csrfResponse = handleCsrf(request);
  if (csrfResponse) return csrfResponse;

  // 4. Run Admin Auth Check
  if (request.nextUrl.pathname.includes('/admin') &&
    !request.nextUrl.pathname.includes('/admin/login') &&
    !request.nextUrl.pathname.includes('/api/v1/admin/me')) {

    let token = request.cookies.get('apex_session')?.value ||
      request.cookies.get('sb-access-token')?.value ||
      request.cookies.get(`sb-${process.env.NEXT_PUBLIC_SUPABASE_REFERENCE_ID}-auth-token`)?.value;

    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else {
        if (request.nextUrl.pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const url = request.nextUrl.clone();
        url.pathname = '/en/login';
        return NextResponse.redirect(url);
      }
    }

    try {
      const { payload } = await jwtVerify(token as string, JWT_SECRET);
      const userId = payload.sub;

      if (!userId) throw new Error('No subject in JWT');

      // Check for admin role in app_metadata (Supabase standard)
      const appMetadata = (payload as any).app_metadata || {};
      const userRole = appMetadata.role || (payload as any).role;

      // STRICT CHECK: If the route is /admin, the user MUST have 'admin' or 'service_role' claim.
      const isSuperAdmin = userRole === 'service_role' || userRole === 'admin' || userRole === 'super_admin';

      if (!isSuperAdmin) {
        logger.warn(`[Middleware] Blocked non-admin user ${userId} from ${request.nextUrl.pathname}`);
        if (request.nextUrl.pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
        }
        const url = request.nextUrl.clone();
        url.pathname = '/en/login';
        return NextResponse.redirect(url);
      }

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-admin-role', 'admin');

      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.next({ request: { headers: requestHeaders } });
      }

    } catch (err) {
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 }); // Changed 403 to 401 for Invalid Token
      }
      const url = request.nextUrl.clone();
      url.pathname = '/en/login';
      return NextResponse.redirect(url);
    }
  }

  // 4.5. Run User Auth Check (Protected Routes)
  const protectedPaths = [
    '/dashboard',
    '/trade',
    '/settings',
    '/wolf-pack',
    '/reports',
    '/referral',
    '/affiliate',
    '/admin-inspector'
  ];

  // Check if current path is protected (ignoring locale prefix)
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPaths.some(path =>
    pathname.startsWith(path) ||
    pathname.match(new RegExp(`^/(${locales.join('|')})${path}`))
  );

  if (isProtected) {
    let token = request.cookies.get('apex_session')?.value ||
      request.cookies.get('sb-access-token')?.value ||
      request.cookies.get(`sb-${process.env.NEXT_PUBLIC_SUPABASE_REFERENCE_ID}-auth-token`)?.value;

    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else {
        // Redirect to login
        const url = request.nextUrl.clone();
        // Preserve locale if present
        const localeMatch = pathname.match(new RegExp(`^/(${locales.join('|')})`));
        const locale = localeMatch ? localeMatch[1] : 'en';
        url.pathname = `/${locale}/login`;
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
    }

    try {
      // Verify token
      const { payload } = await jwtVerify(token as string, JWT_SECRET);
      if (!payload.sub) throw new Error('No subject in JWT');
    } catch (err) {
      // Token invalid/expired
      const url = request.nextUrl.clone();
      const localeMatch = pathname.match(new RegExp(`^/(${locales.join('|')})`));
      const locale = localeMatch ? localeMatch[1] : 'en';
      url.pathname = `/${locale}/login`;
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // 5. Run Internationalization Routing (for pages)
  if (!request.nextUrl.pathname.startsWith('/api') &&
    !request.nextUrl.pathname.startsWith('/_next') &&
    !request.nextUrl.pathname.startsWith('/_sites') && // Exclude rewritten sites
    !request.nextUrl.pathname.includes('.')) {

    logger.debug('[i18n Debug] Processing path:', { path: request.nextUrl.pathname });

    // Check if path already has a locale prefix
    const supportedLocales = locales;
    const pathSegments = request.nextUrl.pathname.split('/').filter(Boolean);
    const hasLocalePrefix = pathSegments.length > 0 && supportedLocales.includes(pathSegments[0]);

    logger.debug('[i18n Debug] Path info:', { segments: pathSegments, hasPrefix: hasLocalePrefix });

    // If no locale prefix, redirect to appropriate locale
    if (!hasLocalePrefix) {
      const country = request.headers.get('x-vercel-ip-country');
      let locale = 'en';

      if (country === 'VN') locale = 'vi';
      else if (country === 'TH') locale = 'th';
      else if (country === 'ID') locale = 'id';
      else if (country === 'KR') locale = 'ko';
      else if (country === 'JP') locale = 'ja';
      else if (country === 'CN') locale = 'zh';

      const newPath = `/${locale}${request.nextUrl.pathname}${request.nextUrl.search}`;
      logger.debug('[i18n Debug] REDIRECTING TO:', { newPath });
      return NextResponse.redirect(new URL(newPath, request.url));
    }

    logger.debug('[i18n Debug] Calling intlMiddleware');
    const response = intlMiddleware(request);
    return injectCsrfToken(request, response);
  }

  // 6. Default pass-through for API
  // CRITICAL SECURITY FIX: Ensure all API routes are checked
  if (request.nextUrl.pathname.startsWith('/api')) {
    logger.error('Middleware API Check:', request.nextUrl.pathname);
    // Whitelist public API routes
    const publicApiRoutes = [
      '/api/v1/auth/login',
      '/api/v1/auth/signup',
      '/api/v1/auth/callback',
      '/api/v1/auth/me', // Whitelist generic auth check
      '/api/auth', // Whitelist all NextAuth/Custom Auth routes (recover, callback, etc)
      '/api/debug', // Whitelist debug routes
      '/api/v1/public',
      '/api/webhooks', // Webhooks usually have their own signature verification
      '/api/v1/market/analyze', // Public demo endpoint
      '/api/v1/user/verify-account', // Public verification endpoint
      '/api/v1/user/verify-account', // Public verification endpoint
      '/api/marketplace', // Public marketplace endpoint
      '/api/v1/referral/stats' // Handled by route handler (Custom Auth)
    ];

    const isPublicApi = publicApiRoutes.some(route => request.nextUrl.pathname.startsWith(route));

    // Special case: Copy Trading Leaderboard is public (GET), but Actions are protected (POST/DELETE)
    const isCopyTradingPublic = request.nextUrl.pathname === '/api/v1/trading/copy-trading' && request.method === 'GET';

    if (!isPublicApi && !isCopyTradingPublic) {
      // Check for authentication
      let token = request.cookies.get('apex_session')?.value ||
        request.cookies.get('sb-access-token')?.value ||
        request.cookies.get(`sb-${process.env.NEXT_PUBLIC_SUPABASE_REFERENCE_ID}-auth-token`)?.value;

      if (!token) {
        const authHeader = request.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      try {
        await jwtVerify(token, JWT_SECRET);
      } catch (err) {
        return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
      }
    }
  }

  let response = NextResponse.next();
  return injectCsrfToken(request, response);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    // REMOVED 'api' from exclusion to ensure API routes are protected
    '/((?!_next/static|_next/image|_vercel|favicon.ico|.*\\..*).*)'
  ]
};
