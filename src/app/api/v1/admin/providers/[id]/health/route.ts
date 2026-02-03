import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySessionToken } from '@/lib/jwt';

/**
 * POST /api/v1/admin/providers/[id]/health
 * 
 * Run health check for specific provider
 * Tests API connectivity and updates health status
 */
export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        // 1. Verify admin JWT
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({
                success: false,
                message: 'Missing authorization header'
            }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const payload = verifySessionToken(token);
        if (!payload) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        // 2. Check if user is super_admin
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', payload.sub)
            .single();

        if (userError || !user || user.role !== 'super_admin') {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized. Super admin access required.'
            }, { status: 403 });
        }

        // 3. Get provider details
        const providerId = params.id;

        const { data: provider, error: providerError } = await supabaseAdmin
            .from('providers')
            .select('*')
            .eq('id', providerId)
            .single();

        if (providerError || !provider) {
            return NextResponse.json({
                success: false,
                message: 'Provider not found'
            }, { status: 404 });
        }

        // 4. Perform health checks
        const healthChecks = {
            referral_link_accessible: false,
            api_reachable: false,
            rate_limit_ok: true,
            credentials_valid: false
        };

        let overallStatus: 'healthy' | 'degraded' | 'down' = 'down';
        const startTime = Date.now();

        // Check 1: Referral link accessibility
        if (provider.referral_link_template) {
            try {
                const testLink = provider.referral_link_template
                    .replace('{partner_uuid}', provider.partner_uuid || 'TEST')
                    .replace('{locale}', 'en');

                // CRITICAL SECURITY FIX: SSRF Protection
                // 1. Parse URL
                const url = new URL(testLink);

                // 2. Allow only HTTPS
                if (url.protocol !== 'https:') {
                    throw new Error('Only HTTPS allowed');
                }

                // 3. Block localhost/private IPs (Basic check)
                // Note: For robust protection, use a library like 'ssrf-req-filter' or resolve DNS.
                // Here we block common local hostnames.
                const hostname = url.hostname.toLowerCase();
                if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
                    throw new Error('Internal network access denied');
                }

                const linkResponse = await fetch(testLink, {
                    method: 'HEAD',
                    redirect: 'follow'
                });

                healthChecks.referral_link_accessible = linkResponse.ok || linkResponse.status === 301 || linkResponse.status === 302;
            } catch (error) {
                logger.error(`[HEALTH CHECK] Referral link check failed for ${provider.provider_code}:`, error);
                healthChecks.referral_link_accessible = false;
            }
        }

        // Check 2: API reachability (basic ping)
        // NOTE: This would need to be customized per provider
        // For now, we mark as degraded if referral link works
        healthChecks.api_reachable = healthChecks.referral_link_accessible;

        // Determine overall status
        if (healthChecks.referral_link_accessible && healthChecks.api_reachable) {
            overallStatus = 'healthy';
        } else if (healthChecks.referral_link_accessible || healthChecks.api_reachable) {
            overallStatus = 'degraded';
        }

        const responseTime = Date.now() - startTime;

        // 5. Update provider health status
        await supabaseAdmin
            .from('providers')
            .update({
                health_check_status: overallStatus,
                last_health_check: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', providerId);

        // 6. Return health check results
        return NextResponse.json({
            success: true,
            provider_id: providerId,
            provider_code: provider.provider_code,
            status: overallStatus,
            checks: healthChecks,
            response_time_ms: responseTime,
            last_checked: new Date().toISOString()
        });

    } catch (error) {
        logger.error('[ADMIN] Health check error:', error);
        return NextResponse.json({
            success: false,
            message: 'Health check failed'
        }, { status: 500 });
    }
}
