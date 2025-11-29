import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { rebalancePortfolio } from '@/lib/ai/singularity/rebalancer';

export async function POST(req: NextRequest) {
  const { userId, amount } = await req.json();
  const supabase = getSupabaseClient();

  // 1. Deposit to "Singularity Fund" (Virtual Concept)
  // We allocate this to a special system agent or trigger auto-allocation
  
  // Check Balance
  const { data: wallet } = await supabase
    .from('virtual_wallets')
    .select('balance')
    .eq('user_id', userId)
    .single();

  if (!wallet || wallet.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
  }

  // Deduct
  await supabase
    .from('virtual_wallets')
    .update({ balance: wallet.balance - amount })
    .eq('user_id', userId);

  // 2. Initial Allocation (Spread across top agents immediately)
  // We reuse rebalance logic but need to inject the fresh capital first
  // Let's insert a placeholder investment record for "Unallocated" then rebalance
  // Or just call rebalance with "new capital" logic
  
  // For demo:
  await rebalancePortfolio(userId); 

  return NextResponse.json({ success: true, message: 'Singularity Mode Activated' });
}
