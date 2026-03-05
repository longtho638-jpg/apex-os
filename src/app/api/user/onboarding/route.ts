import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const { data, error } = await supabase.from('user_onboarding').select('*').eq('user_id', userId).single();

  if (error) {
    // Initialize if not exists
    const { data: newData } = await supabase.from('user_onboarding').insert({ user_id: userId }).select().single();

    return NextResponse.json(newData || {});
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { userId, step } = await req.json();

  const updateData: any = {};
  updateData[`step_${step}`] = true;

  await supabase.from('user_onboarding').update(updateData).eq('user_id', userId);

  return NextResponse.json({ success: true });
}
