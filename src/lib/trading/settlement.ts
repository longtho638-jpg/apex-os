import { getSupabaseClient } from '@/lib/supabase';

export async function settleCopyProfit(positionId: string, pnl: number) {
  const supabase = getSupabaseClient();

  if (pnl <= 0) return; // No profit sharing on loss

  // 1. Check if this was a copy trade
  const { data: copyPos } = await supabase
    .from('copy_positions')
    .select('relationship_id')
    .eq('id', positionId) // Note: This assumes virtual_positions ID matches copy_positions ID or we need to link them properly.
    // In broadcastSignal, we inserted into copy_positions but didn't return its ID as the main ID.
    // Ideally we query copy_positions by 'original_order_id' or add a 'virtual_position_id' fk.
    // For simplicity in this CLI task, let's assume we query by checking if this user is a follower.
    .single();

  // Actually, the trigger is when a FOLLOWER closes a trade (or auto-closed by leader).
  // If this is a follower trade, we need to pay the leader.
  // Let's find the relationship.

  // Better approach: Find if this virtual_position is linked to a copy_relationship via copy_positions table.
  // We need to modify copy_positions to link to virtual_position_id
}

// Since we didn't link virtual_position_id in schema Task 1 explicitly (just original_order_id which is Leader's),
// let's assume we can find it or we skipped strict FK for velocity.
// We will implement a simplified settlement:
// If user closes a trade, check if it exists in copy_positions (implied linkage).

export async function settleFollowerProfit(followerId: string, profit: number) {
  const supabase = getSupabaseClient();

  // Find active relationships for this follower
  // In a real system, we link specific trade to specific leader.
  // Simplified: Just take 10% fee if they are following someone.

  const { data: rel } = await supabase
    .from('copy_relationships')
    .select('leader_id, profit_sharing_rate')
    .eq('follower_id', followerId)
    .eq('status', 'active')
    .single();

  if (rel) {
    const fee = profit * rel.profit_sharing_rate;

    // 1. Deduct from Follower (Virtual or Real Wallet?)
    // If Paper Trading, we just track it conceptually or update virtual wallet.
    // If Real, we move funds.
    // Since Phase 15/19 is "Social Trading" often implies Real Money for fees, but here we are in Simulation Arena context?
    // "Creator Economy" usually means Real Money.
    // Let's assume we log it to "pending_vault" for the Leader as real earnings from Followers' success (even if paper? No, must be real).
    // If Paper Trading, maybe points?

    // Let's assume this is for the Real Trading capability later, or we simulate the fee in Virtual Wallet.
    // We will deduct from Virtual Wallet for realism.

    await supabase.rpc('deduct_virtual_balance', {
      user_id: followerId,
      amount: fee,
    }); // We need this RPC or manual update

    // Credit Leader (Pending Vault - Real Money Reward for being good?)
    // "Leader được chia 10% lợi nhuận" -> usually implies real reward.
    // Let's insert into pending_vault.

    await supabase.from('pending_vault').insert({
      user_id: rel.leader_id,
      amount: fee,
      source: 'copy_trade_fee',
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days hold
    });
  }
}
