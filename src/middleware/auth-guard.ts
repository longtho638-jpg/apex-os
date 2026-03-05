import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.SUPABASE_JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

export async function authGuard(request: NextRequest) {
  const token =
    request.cookies.get('apex_session')?.value ||
    request.cookies.get('sb-access-token')?.value ||
    request.cookies.get(`sb-${process.env.NEXT_PUBLIC_SUPABASE_REFERENCE_ID}-auth-token`)?.value ||
    request.headers.get('authorization')?.substring(7);

  if (!token) {
    return { authorized: false, response: null };
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const appMetadata = (payload as any).app_metadata || {};
    const userRole = appMetadata.role || (payload as any).role;

    const isAdmin = userRole === 'service_role' || userRole === 'admin' || userRole === 'super_admin';

    return {
      authorized: true,
      payload,
      isAdmin,
      userId: payload.sub,
      token,
    };
  } catch (_err) {
    return { authorized: false, response: null };
  }
}
