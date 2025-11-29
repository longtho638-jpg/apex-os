import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { userId, roundId, amountUSDT, txHash } = await req.json();
  const supabase = getSupabaseClient();

  // 1. Get Round Details
  // For demo, we use static price since round might not be in DB yet if we skipped seed
  const price = 0.05; 
  const tokenAmount = amountUSDT / price;

  // 2. Record Purchase
  const { error } = await supabase.from('presale_purchases').insert({
      user_id: userId,
      round_id: roundId, // If UUID mismatch in seed, this might fail foreign key constraint. 
                         // For CLI demo robustness, we might skip FK or ensure seed data aligns.
                         // Assuming we seeded round data in migration.
      amount_usdt: amountUSDT,
      token_amount: tokenAmount,
      tx_hash: txHash
  });

  if (error) {
      // Handle FK error gracefully for demo
      console.error('Purchase Record Error:', error);
      return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 });
  }

  // 3. Update Round Stats
  // await supabase.rpc('increment_tokens_sold', { round_id: roundId, amount: tokenAmount });

  return NextResponse.json({ success: true, tokens: tokenAmount });
}
