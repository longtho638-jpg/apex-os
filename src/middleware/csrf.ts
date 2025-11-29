import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * CSRF Protection Middleware using Double Submit Cookie Pattern
 * 
 * 1. GET request: Generate CSRF token if missing, set in cookie (readable)
 * 2. POST/PUT/DELETE: Verify X-CSRF-Token header matches cookie
 */
export function handleCsrf(request: NextRequest, response?: NextResponse) {
    // Skip for non-browser clients (e.g., Mobile App with API Key, or Server-to-Server)
    // We can detect this via specific headers like "X-Client-Type: mobile" or "Authorization: Bearer ..." 
    // (if we support Bearer tokens separate from cookies).
    // For now, assuming Cookie-based auth means Browser.

    const method = request.method;
    const path = request.nextUrl.pathname;

    // Skip safe methods and public routes
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        return null;
    }

    // Skip Login/Signup (initial entry points) - or strictly check Origin
    if (path.startsWith('/api/v1/auth/') || path.startsWith('/api/auth/')) {
        return null;
    }

    // Verify CSRF Token
    const csrfCookie = request.cookies.get('csrf_token')?.value;
    const csrfHeader = request.headers.get('x-csrf-token');

    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        return NextResponse.json(
            { success: false, message: 'Invalid CSRF token' },
            { status: 403 }
        );
    }

    return null; // Valid
}

/**
 * Inject CSRF token into response cookies if not present
 */
export function injectCsrfToken(request: NextRequest, response: NextResponse) {
    const currentToken = request.cookies.get('csrf_token')?.value;

    if (!currentToken) {
        const newToken = uuidv4();
        response.cookies.set('csrf_token', newToken, {
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: false // Must be readable by JS to send in header
        });
    }
    return response;
}
