import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const supabase = getSupabaseClient();
  const { followerId, leaderId, amount } = await req.json();

  if (!followerId || !leaderId || !amount) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (followerId === leaderId) {
    return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
  }

  // 1. Check Balance (Real or Virtual?)
  // Assuming Virtual Wallet for Phase 15 context
  const { data: wallet } = await supabase.from('virtual_wallets').select('balance').eq('user_id', followerId).single();

  if (!wallet || wallet.balance < amount) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
  }

  // 2. Create Relationship
  const { error } = await supabase.from('copy_relationships').insert({
    follower_id: followerId,
    leader_id: leaderId,
    allocation_amount: amount,
    status: 'active',
  });

  if (error) {
    // Handle duplicate follow
    if (error.code === '23505') {
      // Unique violation
      return NextResponse.json({ error: 'Already following this trader' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to follow' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
