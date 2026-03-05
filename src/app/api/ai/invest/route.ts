import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const supabase = getSupabaseClient();
  const { userId, agentId, amount } = await req.json();

  if (!userId || !agentId || !amount) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // 1. Check Wallet Balance
  const { data: wallet } = await supabase.from('virtual_wallets').select('balance').eq('user_id', userId).single();

  if (!wallet || wallet.balance < amount) {
    return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
  }

  // 2. Deduct Funds
  await supabase
    .from('virtual_wallets')
    .update({ balance: wallet.balance - amount })
    .eq('user_id', userId);

  // 3. Add Investment
  const { error } = await supabase.from('ai_investments').insert({
    user_id: userId,
    agent_id: agentId,
    amount,
  });

  if (error) {
    return NextResponse.json({ error: 'Failed to invest' }, { status: 500 });
  }

  // 4. Update Agent AUM
  await supabase.rpc('increment_agent_aum', { p_agent_id: agentId, p_amount: amount });
  // Or simple update if no RPC
  /*
  const { data: agent } = await supabase.from('ai_agents').select('total_aum').eq('id', agentId).single();
  await supabase.from('ai_agents').update({ total_aum: (agent.total_aum || 0) + amount }).eq('id', agentId);
  */

  return NextResponse.json({ success: true });
}
