import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  await supabase
    .from('user_onboarding')
    .update({ completed_at: new Date().toISOString() })
    .eq('user_id', userId);

  // Optional: Track analytics event here if needed

  return NextResponse.json({ success: true });
}
