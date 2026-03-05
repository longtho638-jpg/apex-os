import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// Using Service Role to bypass RLS for analytics insertion
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, properties, timestamp } = body;

    if (!event) {
      return NextResponse.json({ error: 'Event name required' }, { status: 400 });
    }

    // Store in analytics_events table
    const { error } = await supabase.from('analytics_events').insert({
      event_name: event,
      properties: properties || {},
      created_at: timestamp || new Date().toISOString(),
    });

    if (error) {
      logger.error('Supabase Analytics Error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}
