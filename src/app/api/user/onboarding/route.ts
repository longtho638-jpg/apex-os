import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('user_onboarding')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // Initialize if not exists
    // Note: In a real app, this might be done on user signup trigger
    const { data: newData, error: insertError } = await supabase
      .from('user_onboarding')
      .insert({ user_id: userId })
      .select()
      .single();
    
    if (insertError) {
        console.error("Error creating onboarding record", insertError);
        return NextResponse.json({});
    }

    return NextResponse.json(newData || {});
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { userId, step } = await req.json();
  const supabase = getSupabaseClient();

  const updateData: any = {};
  updateData[`step_${step}`] = true;

  await supabase
    .from('user_onboarding')
    .update(updateData)
    .eq('user_id', userId);

  return NextResponse.json({ success: true });
}
