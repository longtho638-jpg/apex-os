import { logger } from '@/lib/logger';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { applyRateLimit } from '@/middleware/rateLimit';

export async function GET(request: NextRequest) {
    try {
        // Rate Limit
        const limitRes = await applyRateLimit(request);
        if (limitRes) return limitRes;

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Define known agents
        const agents = [
            { id: 'guardian_agent', name: 'Guardian (Risk)', type: 'risk' },
            { id: 'trading_engine', name: 'Trading Core', type: 'core' },
            { id: 'auditor_agent', name: 'Auditor (Finance)', type: 'audit' }
        ];

        // Fetch metrics from event bus (last 1 hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

        const { data: events, error } = await supabase
            .from('agent_events')
            .select('source, status')
            .gte('created_at', oneHourAgo);

        if (error) throw error;

        // Aggregation
        const agentStats = agents.map(agent => {
            const agentEvents = events?.filter(e => e.source === agent.id) || [];
            const total = agentEvents.length;
            const failed = agentEvents.filter(e => e.status === 'failed').length;
            const active = total > 0;
            
            // Determine health
            let status = 'offline';
            if (active) {
                status = failed > 0 ? 'degraded' : 'healthy';
            }

            return {
                id: agent.id,
                name: agent.name,
                type: agent.type,
                status: status, // healthy, degraded, offline
                last_heartbeat: active ? new Date().toISOString() : null, // Mock heartbeat for now
                metrics: {
                    events_1h: total,
                    errors_1h: failed,
                    success_rate: total > 0 ? ((total - failed) / total * 100).toFixed(1) + '%' : 'N/A'
                }
            };
        });

        return NextResponse.json({
            success: true,
            data: agentStats
        });

    } catch (error: any) {
        logger.error('Agent status API error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch agent status' },
            { status: 500 }
        );
    }
}
