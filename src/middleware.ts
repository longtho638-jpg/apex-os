import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';
import { applyRateLimit } from '@/middleware/rateLimit';
import { validateRequestSignature } from '@/middleware/signature';
import { handleCsrf, injectCsrfToken } from '@/middleware/csrf';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const JWT_SECRET = new TextEncoder().encode(
  process.env.SUPABASE_JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Create a single supabase client for interacting with your database
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Custom locale handling to bypass next-intl config requirement
const locales = ['en', 'vi'];
const defaultLocale = 'en';

function getLocale(pathname: string): string | null {
  const segments = pathname.split('/');
  const locale = segments[1];
  return locales.includes(locale) ? locale : null;
}

function handleI18nRouting(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;

  // Check if pathname already has a locale
  const locale = getLocale(pathname);
  if (locale) return null;

  // Redirect to default locale if no locale in path
  const newUrl = request.nextUrl.clone();
  newUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(newUrl);
}

export async function middleware(request: NextRequest) {
  // 0. Global Rate Limiting (API Only)
  const rateLimitResponse = await applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  // 1. Request Signing (Critical Paths Only)
  // Note: We skip this for now to avoid breaking frontend dev, but it's implemented.
  // Uncomment to enforce:
  // const sigResponse = await validateRequestSignature(request);
  // if (sigResponse) return sigResponse;

  // 2. CSRF Protection (Mutation API Only)
  const csrfResponse = handleCsrf(request);
  if (csrfResponse) return csrfResponse;

  // 3. Run Admin Auth Check first for protected routes
  // Exclude login pages AND the /api/v1/admin/me endpoint (handled by AuthContext with soft 401)
  let response = NextResponse.next(); // Default response

  if (request.nextUrl.pathname.includes('/admin') && 
      !request.nextUrl.pathname.includes('/admin/login') &&
      !request.nextUrl.pathname.includes('/api/v1/admin/me')) {
    // Extract token from cookie (Supabase auth or Apex session)
    let token = request.cookies.get('apex_session')?.value ||
      request.cookies.get('sb-access-token')?.value ||
      request.cookies.get(`sb-${process.env.NEXT_PUBLIC_SUPABASE_REFERENCE_ID}-auth-token`)?.value;

    if (!token) {
      // Check Authorization header as fallback
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else {
        const url = request.nextUrl.clone();
        url.pathname = '/en/login';
        url.searchParams.set('error', 'middleware_no_token');
        return NextResponse.redirect(url);
      }
    }

    try {
      // Verify JWT offline (faster & more reliable)
      const { payload } = await jwtVerify(token as string, JWT_SECRET);
      const userId = payload.sub;

      if (!userId) {
        throw new Error('No subject in JWT');
      }

      // Check if user exists in admin_users table
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('role, ip_whitelist_enabled, allowed_ips')
        .eq('id', userId)
        .single();

      // Fallback: Check users table for super_admin role
      let role = 'admin';
      let ipSettings = adminUser;

      // 🔥 DEVELOPMENT BYPASS: Allow any authenticated user in dev
      const isDev = process.env.NODE_ENV !== 'production';
      if (isDev && !adminUser) {
        console.log('🔓 DEV BYPASS: Granting admin access to authenticated user:', userId);
        role = 'super_admin';
        ipSettings = { ip_whitelist_enabled: false, allowed_ips: [] } as any;
      } else if (!adminUser) {
        const { data: superAdminUser } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();

        if (superAdminUser?.role === 'super_admin') {
          role = 'super_admin';
          ipSettings = { ip_whitelist_enabled: false, allowed_ips: [] } as any;
        } else {
          const url = request.nextUrl.clone();
          url.pathname = '/en/login';
          url.searchParams.set('error', 'middleware_not_admin');
          return NextResponse.redirect(url);
        }
      } else {
        role = adminUser.role;
      }

      // --- IP WHITELIST CHECK ---
      if (ipSettings?.ip_whitelist_enabled) {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
          request.headers.get('x-real-ip') ||
          'unknown';

        const allowedIPs = ipSettings.allowed_ips || [];
        let accessGranted = false;

        if (allowedIPs.length > 0) {
          for (const allowed of allowedIPs) {
            if (allowed === ip) {
              accessGranted = true;
              break;
            }
            if (ip === '::1' && allowed === '::1') accessGranted = true;
          }
        }

        if (!accessGranted) {
          return new NextResponse('Access Denied: IP not whitelisted', { status: 403 });
        }
      }
      // ---------------------------

      // Update Headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-admin-role', role);

      // If it's an API route, we return a response with headers
      if (request.nextUrl.pathname.startsWith('/api/')) {
        response = NextResponse.next({
          request: { headers: requestHeaders },
        });
      }

    } catch (err) {
      console.error('Middleware Auth Error:', err);
      const url = request.nextUrl.clone();
      url.pathname = '/en/login';
      url.searchParams.set('error', 'middleware_error');
      return NextResponse.redirect(url);
    }
  } else {
    // 4. Run Custom Internationalization Routing if not admin
    const i18nResponse = handleI18nRouting(request);
    if (i18nResponse) return i18nResponse;
  }

  // 5. Inject CSRF Token into response (for all valid requests)
  return injectCsrfToken(request, response);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
