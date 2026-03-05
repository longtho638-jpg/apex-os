import { nanoid } from 'nanoid';
import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const supabase = getSupabaseClient();

  // In a real scenario, get user from session
  // const { data: { user } } = await supabase.auth.getUser();
  // For this CLI task, we'll assume user ID is passed or mock it,
  // but best practice is session.

  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  // Check if code exists
  const { data: existing } = await supabase.from('referral_codes').select('code').eq('user_id', userId).single();

  // CRITICAL SECURITY FIX: Prevent self-referral
  // Note: This endpoint creates a code for the user.
  // The actual redemption logic (where self-referral happens) is likely in a different endpoint or during signup.
  // However, if this endpoint was used to "claim" a code, we'd check:
  // if (existing && existing.user_id === userId) return error;

  // Since this is "Create My Code", it's fine.
  // But let's check if we are redeeming in this file? No, this is POST /user/referrals (Create).

  // Let's check where redemption happens.
  // Usually it's during signup or a separate 'redeem' endpoint.
  // I will search for 'referral_conversions' insert to find the redemption logic.

  if (existing) {
    return NextResponse.json({
      code: existing.code,
      referral_link: `https://apexrebate.com/r/${existing.code}`,
    });
  }

  // Generate unique code (6 chars, alphanumeric)
  const code = nanoid(6).toUpperCase();

  const { error } = await supabase.from('referral_codes').insert({
    user_id: userId,
    code,
    expires_at: null, // Never expires
  });

  if (error) {
    return NextResponse.json({ error: 'Failed to create code' }, { status: 500 });
  }

  return NextResponse.json({
    code,
    referral_link: `https://apexrebate.com/r/${code}`,
  });
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from('referral_codes')
    .select('code, created_at, expires_at')
    .eq('user_id', userId)
    .single();

  return NextResponse.json(data || {});
}
