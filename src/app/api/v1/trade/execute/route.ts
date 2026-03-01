import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/viral-economics/auth';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: Request) {
  const userId = await authenticateRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { symbol, side, amount, leverage, entryPrice, orgId } = body;

  const supabase = getSupabaseClient();

  // 1. Check Balance
  const { data: wallet } = await supabase
    .from('user_wallets')
    .select('balance')
    .eq('user_id', userId)
    .single();

  if (!wallet || wallet.balance < amount) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
  }

  // 2. Create Position
  const { data: position, error: posError } = await supabase
    .from('positions')
    .insert({
      user_id: userId,
      org_id: orgId || null,
      symbol: symbol,
      side: side.toUpperCase(),
      entry_price: entryPrice,
      current_price: entryPrice,
      size: amount * leverage,
      leverage: leverage,
      status: 'OPEN'
    })
    .select()
    .single();

  if (posError) {
    return NextResponse.json({ error: posError.message }, { status: 500 });
  }

  // 3. Deduct Balance (Margin)
  const { error: walletError } = await supabase
    .from('user_wallets')
    .update({ balance: wallet.balance - amount })
    .eq('user_id', userId);

  if (walletError) {
    // Rollback position if wallet update fails (Manual rollback for now)
    await supabase.from('positions').delete().eq('id', position.id);
    return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 });
  }

  return NextResponse.json({ success: true, position });
}
