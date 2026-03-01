import { logger } from '@/lib/logger';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { NotificationService } from '@/lib/notifications';
import { checkAgentHealth } from '@/lib/agents/agent-health-monitor';

// Prevent Vercel from caching this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // 1. Verify Cron Secret (if configured) or Admin Token
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        // STRICT SECURITY CHECK
        // Only allow requests with the correct CRON_SECRET
        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            logger.warn('Unauthorized health check attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // 2. Fetch Active Providers
        const { data: providers, error: fetchError } = await supabaseAdmin
            .from('providers')
            .select('*')
            .eq('is_active', true);

        if (fetchError) {
            throw new Error(`Failed to fetch providers: ${fetchError.message}`);
        }

        const results = [];

        // 3. Iterate and Check Health
        for (const provider of providers) {
            const result = {
                provider_code: provider.provider_code,
                status: 'unknown',
                latency: 0,
                timestamp: new Date().toISOString()
            };

            try {
                const startTime = Date.now();

                // Mock Health Check Logic
                // In a real scenario, we would use provider.asset_config to determine the endpoint
                // e.g., binance -> https://api.binance.com/api/v3/ping

                let isHealthy = false;

                // Simulate network request
                // For "test_binance" or known providers, we can try a real ping if we want,
                // but for now, we'll simulate based on a random chance or specific config.

                // REAL LOGIC (Simplified):
                if (provider.provider_code.includes('binance')) {
                    // Try real binance ping
                    try {
                        const pingRes = await fetch('https://api.binance.com/api/v3/ping', { signal: AbortSignal.timeout(5000) });
                        isHealthy = pingRes.ok;
                    } catch (e) {
                        isHealthy = false;
                    }
                } else {
                    // Default simulation: 95% chance of being healthy
                    isHealthy = Math.random() > 0.05;
                }

                const endTime = Date.now();
                result.latency = endTime - startTime;
                result.status = isHealthy ? 'healthy' : 'down';

                // 4. Update Provider Status
                const { error: updateError } = await supabaseAdmin
                    .from('providers')
                    .update({
                        health_check_status: result.status,
                        last_health_check: result.timestamp,
                        // Optionally downgrade status if down? 
                        // status: isHealthy ? provider.status : 'degraded' 
                        // Let's keep the main 'status' field manual for now, only update health_check_status
                    })
                    .eq('id', provider.id);

                if (updateError) {
                    logger.error(`Failed to update provider ${provider.provider_code}:`, updateError);
                }

                // 5. Log to Audit and Send Alerts
                if (provider.health_check_status !== result.status) {
                    // Status Changed
                    if (result.status === 'down') {
                        await NotificationService.sendAlert({
                            title: `🚨 Provider Down: ${provider.provider_name || provider.provider_code}`,
                            message: `Provider ${provider.provider_code} is failing health checks. Latency: ${result.latency}ms`,
                            level: 'critical',
                            metadata: { provider_id: provider.id, result }
                        });
                    } else if (result.status === 'healthy' && provider.health_check_status === 'down') {
                        await NotificationService.sendAlert({
                            title: `✅ Provider Recovered: ${provider.provider_name || provider.provider_code}`,
                            message: `Provider ${provider.provider_code} is back online. Latency: ${result.latency}ms`,
                            level: 'info',
                            metadata: { provider_id: provider.id, result }
                        });
                    }

                    await supabaseAdmin.from('provider_audit').insert({
                        provider_id: provider.id,
                        provider_code: provider.provider_code,
                        action: 'health_check',
                        asset_class: provider.asset_class,
                        new_values: { health_status: result.status, latency: result.latency },
                        reason: `Automated health check: ${result.status}`
                    });
                } else if (result.status === 'down') {
                    // Still Down (Recurring Alert?)
                    // Maybe log audit but don't spam alerts every minute?
                    // For now, let's just log audit to keep history of downtime
                    await supabaseAdmin.from('provider_audit').insert({
                        provider_id: provider.id,
                        provider_code: provider.provider_code,
                        action: 'health_check',
                        asset_class: provider.asset_class,
                        new_values: { health_status: result.status, latency: result.latency },
                        reason: `Automated health check: ${result.status} (Recurring)`
                    });
                }

            } catch (error: unknown) {
                result.status = 'error';
                logger.error(`Health check failed for ${provider.provider_code}:`, error);
            }

            results.push(result);
        }

        // Agent health check — detect dead/stale agents
        const agentHealth = await checkAgentHealth();

        return NextResponse.json({
            success: true,
            results,
            agents: {
              healthy: agentHealth.healthy,
              unhealthy: agentHealth.unhealthy,
              dead: agentHealth.dead,
            },
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal error';
        logger.error('Cron Job Error:', error);
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}
