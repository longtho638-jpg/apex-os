import { NextResponse } from 'next/server';
import { getTierByVolume, UNIFIED_TIERS } from '@apex-os/vibe-payment';

export async function GET() {
    // RaaS Model: Zero subscription fees, volume-based tiers
    const monthlyVolume = 45_000; // TODO: Fetch from user's actual 30-day volume
    const currentTier = getTierByVolume(monthlyVolume);
    const tier = UNIFIED_TIERS[currentTier];

    return NextResponse.json({
        model: 'RaaS',
        current_tier: currentTier,
        tier_name: tier.name,
        price: 0,
        billing_cycle: 'none',
        monthly_volume: monthlyVolume,
        volume_threshold: tier.volumeThreshold,
        next_tier_threshold: tier.monthlyVolumeMax === Infinity ? null : tier.monthlyVolumeMax,
        spread_bps: tier.spreadBps,
        self_rebate_rate: tier.selfRebateRate,
        agent_slots: tier.agentSlots,
        commission_rates: tier.commissionRates,
        features: tier.features,
        usage: {
            ai_requests_today: 42,
            ai_requests_limit: tier.aiRequestsPerDay,
            agents_deployed: 1,
            agents_limit: tier.agentSlots,
        },
        volume_history: [
            { month: '2026-02', volume: 38_000 },
            { month: '2026-01', volume: 52_000 },
        ],
    });
}
