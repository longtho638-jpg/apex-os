import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Get client IP from request headers
 * Handles various proxy scenarios (Vercel, Cloudflare, etc.)
 */
function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');

    if (cfConnectingIP) return cfConnectingIP;
    if (forwarded) return forwarded.split(',')[0].trim();
    if (realIP) return realIP;

    return 'unknown';
}

/**
 * Check if IP is whitelisted for user
 * @param userId User ID to check
 * @param clientIP Client's IP address
 * @returns true if allowed, false if blocked
 */
export async function checkIPWhitelist(userId: string, clientIP: string): Promise<boolean> {
    try {
        const { data: user, error } = await supabase
            .from('admin_users')
            .select('allowed_ips')
            .eq('id', userId)
            .single();

        if (error || !user) {
            console.error('IP whitelist check - user not found:', userId);
            return false;
        }

        const allowedIPs: string[] = user.allowed_ips || [];

        // Empty array = allow all IPs (no whitelist set)
        if (allowedIPs.length === 0) {
            return true;
        }

        // Check if client IP is in whitelist
        const isAllowed = allowedIPs.includes(clientIP);

        if (!isAllowed) {
            console.warn(`IP blocked: ${clientIP} for user ${userId}`);

            // Log blocked attempt
            await supabase.from('security_alerts').insert({
                alert_type: 'IP_BLOCKED',
                severity: 'medium',
                user_id: userId,
                message: `Login attempt from non-whitelisted IP: ${clientIP}`,
                metadata: { ip: clientIP, allowed_ips: allowedIPs }
            });
        }

        return isAllowed;
    } catch (error) {
        console.error('IP whitelist check error:', error);
        return false; // Fail closed for security
    }
}

/**
 * Middleware to check IP whitelist for admin routes
 */
export async function withIPWhitelist(request: NextRequest, userId: string) {
    const clientIP = getClientIP(request);
    const isAllowed = await checkIPWhitelist(userId, clientIP);

    if (!isAllowed) {
        return NextResponse.json(
            {
                error: 'Access denied from this IP address',
                clientIP,
                message: 'Contact admin to whitelist your IP'
            },
            { status: 403 }
        );
    }

    return null; // Allow request to continue
}

export { getClientIP };
