import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    // 1. Visitors (Using analytics_events table for 'landing_page_view')
    const { count: visitors } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_name', 'landing_page_view');

    // 2. Signups
    const { count: signups } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // 3. Activations (Users with API keys connected)
    // Assuming an 'api_keys' table exists or user metadata flag
    const { count: activations } = await supabase
      .from('user_api_keys')
      .select('*', { count: 'exact', head: true });

    // 4. Conversions (Paid Subscriptions)
    const { count: conversions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .neq('tier', 'free'); // Assuming 'free' is a tier name, or check price > 0

    const funnelData = [
      { name: 'Visitors', value: visitors || 0, fill: '#3b82f6' },
      { name: 'Signups', value: signups || 0, fill: '#8b5cf6' },
      { name: 'Activations', value: activations || 0, fill: '#10b981' },
      { name: 'Conversions', value: conversions || 0, fill: '#f59e0b' },
    ];

    return NextResponse.json({ funnel: funnelData });

  } catch (error) {
    logger.error('Analytics Funnel Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
