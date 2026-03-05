import { getSupabaseClient } from '@/lib/supabase';

export async function broadcastSignal(leaderId: string, order: any) {
  const supabase = getSupabaseClient();

  // 1. Find active followers
  const { data: followers } = await supabase
    .from('copy_relationships')
    .select('*')
    .eq('leader_id', leaderId)
    .eq('status', 'active');

  if (!followers || followers.length === 0) return;

  // 2. Replicate Trades
  // For simplicity, we assume fixed leverage replication or leader's leverage
  // Pro-rata sizing logic: (Follower Allocation / Leader Portfolio?)
  // Simplified: Follower allocates $1000. If Leader trades 10% of their balance, Follower trades 10% of $1000.
  // Since we don't track Leader Total Balance easily here without query,
  // we'll use a simplified ratio: Fixed Size per trade relative to allocation?
  // Better: Just use 5% of allocation per trade for safety default.

  const tradePromises = followers.map(async (rel) => {
    const size = rel.allocation_amount * 0.05; // 5% risk per trade

    // Execute Trade for Follower (Paper Trading)
    const { data: position, error } = await supabase
      .from('virtual_positions')
      .insert({
        user_id: rel.follower_id,
        symbol: order.symbol,
        side: order.side,
        entry_price: order.entry_price,
        size: size,
        leverage: order.leverage,
        status: 'OPEN',
      })
      .select()
      .single();

    if (!error && position) {
      // Link to copy_positions
      await supabase.from('copy_positions').insert({
        relationship_id: rel.id,
        original_order_id: order.id,
        symbol: order.symbol,
        side: order.side,
        entry_price: order.entry_price,
        size: size,
      });
    }
  });

  await Promise.all(tradePromises);
}
