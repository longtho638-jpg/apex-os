import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
// import { trackEvent } from '@/lib/analytics';

async function trackEvent(params: any) {
    if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics Track]', params);
    }
}

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  const supabase = getSupabaseClient();

  await supabase
    .from('user_onboarding')
    .update({ completed_at: new Date().toISOString() })
    .eq('user_id', userId);

  // Track completion
  await trackEvent({
    event_name: 'onboarding_completed',
    user_id: userId,
    metadata: { completed_at: new Date().toISOString() },
  });

  return NextResponse.json({ success: true });
}
