import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { subscription, userId } = await req.json();
    const supabase = getSupabaseClient();

    if (!subscription || !userId) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Upsert subscription
    // Note: Using endpoint as unique constraint usually
    const { error } = await supabase.from('user_push_subscriptions').upsert(
      {
        user_id: userId,
        endpoint: subscription.endpoint,
        auth: subscription.keys.auth,
        p256dh: subscription.keys.p256dh,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'user_id, endpoint' },
    );

    if (error) {
      logger.error('Push DB Error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Push Subscribe API Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
