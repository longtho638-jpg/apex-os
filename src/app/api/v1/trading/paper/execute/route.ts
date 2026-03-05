import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getSupabaseClient } from '@/lib/supabase';
import { broadcastSignal } from '@/lib/trading/broadcaster';

export async function POST(req: NextRequest) {
  const supabase = getSupabaseClient();
  const { userId, symbol, side, size, leverage, action, positionId } = await req.json();

  const MAX_LEVERAGE = 125;
  if (leverage && (leverage < 1 || leverage > MAX_LEVERAGE)) {
    return NextResponse.json({ error: `Leverage must be between 1 and ${MAX_LEVERAGE}` }, { status: 400 });
  }

  if (!userId || !action) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // 1. Get Current Price (Mock for demo)
    const currentPrice = symbol === 'BTC/USDT' ? 64250.0 : 3450.0;

    if (action === 'OPEN') {
      if (!symbol || !size) return NextResponse.json({ error: 'Missing trade params' }, { status: 400 });

      // Check Balance
      const { data: wallet } = await supabase.from('virtual_wallets').select('balance').eq('user_id', userId).single();

      const marginRequired = size / (leverage || 1);

      if (!wallet || wallet.balance < marginRequired) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
      }

      // Deduct Balance (Margin Lock)
      // Note: In a real system we'd move to 'locked_balance', here we simplify.
      await supabase
        .from('virtual_wallets')
        .update({ balance: wallet.balance - marginRequired })
        .eq('user_id', userId);

      // Create Position
      const { data: position, error } = await supabase
        .from('virtual_positions')
        .insert({
          user_id: userId,
          symbol,
          side,
          entry_price: currentPrice,
          size,
          leverage: leverage || 1,
          status: 'OPEN',
          opened_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Broadcast to Followers (Async - fire and forget)
      broadcastSignal(userId, position).catch((err) => logger.error('Broadcast Error:', err));

      return NextResponse.json({ success: true, position });
    } else if (action === 'CLOSE') {
      if (!positionId) return NextResponse.json({ error: 'Position ID required' }, { status: 400 });

      // Get Position
      const { data: position } = await supabase
        .from('virtual_positions')
        .select('id, symbol, side, size, leverage, entry_price, status, opened_at')
        .eq('id', positionId)
        .single();

      if (!position || position.status !== 'OPEN') {
        return NextResponse.json({ error: 'Position not found or closed' }, { status: 404 });
      }

      // Calculate PnL
      // Long: (Exit - Entry) * Size / Entry * Leverage? Or simply (Exit - Entry) * Quantity?
      // Assuming 'size' is Margin Amount:
      // PnL = (Exit - Entry) / Entry * Margin * Leverage

      const exitPrice = currentPrice; // Mock exit at current market
      const priceDiff = position.side === 'LONG' ? exitPrice - position.entry_price : position.entry_price - exitPrice;

      const pnlPercent = priceDiff / position.entry_price;
      const pnl = pnlPercent * position.size * position.leverage;

      // Return Margin + PnL to Wallet
      const returnAmount = position.size + pnl; // size here was margin used

      // Update Wallet
      const { data: wallet } = await supabase.from('virtual_wallets').select('balance').eq('user_id', userId).single();
      await supabase
        .from('virtual_wallets')
        .update({ balance: (wallet?.balance || 0) + returnAmount })
        .eq('user_id', userId);

      // Close Position
      const { error } = await supabase
        .from('virtual_positions')
        .update({
          status: 'CLOSED',
          closed_at: new Date().toISOString(),
          pnl: pnl,
        })
        .eq('id', positionId);

      if (error) throw error;

      return NextResponse.json({ success: true, pnl });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    logger.error('Trade Execution Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
