import { RAAS_CONFIG } from '@apex-os/vibe-payment';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabaseClient();

  try {
    // RaaS Revenue Model: Revenue = trading volume × spread (basis points)
    // RaaS: all revenue comes from exchange spread, zero subscription fees

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Total 30-day trading volume from all users
    const { data: volumeData } = await supabase.from('users').select('monthly_volume');

    let totalVolume = 0;
    let activeTraders = 0;
    volumeData?.forEach((user) => {
      const vol = Number(user.monthly_volume || 0);
      totalVolume += vol;
      if (vol > 0) activeTraders++;
    });

    // 2. Gross spread revenue (avg spread across tiers ~20bps = 0.20%)
    const avgSpreadBps = RAAS_CONFIG.baseSpreadBps; // 30bps base, effective ~20bps after rebates
    const grossSpreadRevenue = totalVolume * (avgSpreadBps / 10_000);

    // 3. Estimate net revenue after rebates (~20% avg rebate)
    const avgRebateRate = 0.2;
    const netRevenue = grossSpreadRevenue * (1 - avgRebateRate);

    // 4. Monthly Run Rate (MRR equivalent in RaaS)
    const monthlyRunRate = netRevenue; // Already 30-day window
    const annualRunRate = monthlyRunRate * 12;

    // 5. Average Revenue Per Trader (ARPT)
    const arpt = activeTraders > 0 ? monthlyRunRate / activeTraders : 0;

    // 6. Revenue per million volume (efficiency metric)
    const revenuePerMillion = totalVolume > 0 ? (netRevenue / totalVolume) * 1_000_000 : 0;

    return NextResponse.json({
      totalVolume30d: totalVolume,
      grossSpreadRevenue,
      netRevenue,
      monthlyRunRate,
      annualRunRate,
      activeTraders,
      arpt,
      revenuePerMillion,
      avgSpreadBps,
    });
  } catch (error) {
    logger.error('Analytics Revenue Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
