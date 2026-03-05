import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(_req: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    // 1. Visitors (landing page views)
    const { count: visitors } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_name', 'landing_page_view');

    // 2. Signups
    const { count: signups } = await supabase.from('users').select('*', { count: 'exact', head: true });

    // 3. Activations (users with exchange API keys connected)
    const { count: activations } = await supabase.from('user_api_keys').select('*', { count: 'exact', head: true });

    // 4. Conversions (RaaS: users who have traded — volume > 0)
    const { count: conversions } = await supabase
      .from('user_tiers')
      .select('*', { count: 'exact', head: true })
      .gt('monthly_volume', 0);

    const funnelData = [
      { name: 'Visitors', value: visitors || 0, fill: '#3b82f6' },
      { name: 'Signups', value: signups || 0, fill: '#8b5cf6' },
      { name: 'Activations', value: activations || 0, fill: '#10b981' },
      { name: 'Traders', value: conversions || 0, fill: '#f59e0b' },
    ];

    return NextResponse.json({ funnel: funnelData });
  } catch (error) {
    logger.error('Analytics Funnel Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
