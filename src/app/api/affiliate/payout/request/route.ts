import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { userId, amount, method, walletAddress } = await req.json();
  const supabase = getSupabaseClient();

  // 1. Check Balance
  const { data: stats } = await supabase
    .from('affiliate_stats')
    .select('pending_payout')
    .eq('user_id', userId)
    .single();

  if (!stats || stats.pending_payout < amount) {
      return NextResponse.json({ error: 'Insufficient pending balance' }, { status: 400 });
  }

  if (amount < 50) {
      return NextResponse.json({ error: 'Minimum withdrawal is $50' }, { status: 400 });
  }

  // 2. Create Request
  const { error: reqError } = await supabase.from('payout_requests').insert({
      user_id: userId,
      amount,
      status: 'pending',
      method,
      wallet_address: walletAddress,
      created_at: new Date().toISOString()
  });

  if (reqError) {
      return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }

  // 3. Deduct from Pending (Lock funds)
  // Using raw query or simple update if concurrency isn't high risk in this CLI demo
  // Ideally use RPC for atomicity
  const { error: updateError } = await supabase
    .from('affiliate_stats')
    .update({ pending_payout: stats.pending_payout - amount })
    .eq('user_id', userId);

  if (updateError) {
      // Should rollback request creation here in real app
      return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
