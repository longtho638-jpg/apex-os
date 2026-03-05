import { getTierByVolume, UNIFIED_TIERS } from '@apex-os/vibe-payment';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  // RaaS Model: Zero subscription fees, volume-based tiers
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch actual 30-day volume from user_tiers
  const { data: tierData } = await supabase
    .from('user_tiers')
    .select('monthly_volume, tier')
    .eq('user_id', user.id)
    .single();

  const monthlyVolume = tierData?.monthly_volume || 0;
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
