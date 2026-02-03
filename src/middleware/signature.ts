import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@/lib/security/signature';

/**
 * Middleware to enforce HMAC Request Signing on critical endpoints
 */
export async function validateRequestSignature(request: NextRequest) {
    // Only apply to critical financial/admin mutation endpoints
    const CRITICAL_PATHS = [
        '/api/v1/admin/finance',
        '/api/v1/finance', 
        '/api/v1/trade/execute'
    ];

    const path = request.nextUrl.pathname;
    const method = request.method;

    // Skip if not a critical path or strictly read-only (though some GETs might be sensitive, usually GETs are safer)
    // For high security, we might want to sign GETs too, but let's stick to mutations for now.
    const isCritical = CRITICAL_PATHS.some(p => path.startsWith(p));
    if (!isCritical) return null;

    const signature = request.headers.get('x-signature');
    const timestamp = request.headers.get('x-timestamp');

    if (!signature || !timestamp) {
        return NextResponse.json(
            { success: false, message: 'Missing signature headers' },
            { status: 401 }
        );
    }

    // For POST/PUT/DELETE, we need the body.
    // Reading the body in middleware can be tricky in Next.js (stream consumption).
    // However, we can clone the request.
    let bodyStr = '';
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        try {
            const clone = request.clone();
            bodyStr = await clone.text();
        } catch (e) {
            logger.error('Signature validation failed to read body', e);
            return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
        }
    }

    const isValid = verifySignature(method, path, timestamp, signature, bodyStr);

    if (!isValid) {
        return NextResponse.json(
            { success: false, message: 'Invalid request signature' },
            { status: 403 }
        );
    }

    return null; // Valid
}
