import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, LIMITS } from '@/lib/rateLimit';

// Add Institutional Limit to the shared config (or locally here if preferred, but cleaner there)
// We'll cast to any to extend the type locally if needed, or assuming LIMITS is extensible
const INSTITUTIONAL_LIMIT = { limit: 50, windowMs: 1000 }; // 50 requests per second

/**
 * Middleware helper to enforce rate limits on API routes
 * Can be used inside src/middleware.ts
 */
export async function applyRateLimit(request: NextRequest) {
    // Only apply to API routes
    if (!request.nextUrl.pathname.startsWith('/api/')) {
        return null;
    }

    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const path = request.nextUrl.pathname;

    // Determine Limit Config
    let config = LIMITS.API_STANDARD;
    let keyPrefix = 'api';

    if (path.startsWith('/api/v1/institutional')) {
        config = INSTITUTIONAL_LIMIT; // High throughput
        keyPrefix = 'inst';
    }

    // Use GLOBAL limits for general API endpoints
    const limitResult = checkRateLimit(`${keyPrefix}:${ip}`, config);

    if (!limitResult.success) {
        return NextResponse.json(
            { success: false, message: 'Too many requests' },
            { 
                status: 429,
                headers: {
                    'X-RateLimit-Limit': limitResult.limit.toString(),
                    'X-RateLimit-Remaining': limitResult.remaining.toString(),
                    'X-RateLimit-Reset': limitResult.reset.toString()
                }
            }
        );
    }

    return null; // Allowed
}
