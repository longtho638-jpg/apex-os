import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Try to fetch real wallet data
    const { data: wallet, error } = await supabase.from('user_wallets').select('*').eq('user_id', user.id).single();

    if (wallet) {
      return NextResponse.json({
        success: true,
        data: wallet,
        source: 'database',
      });
    }

    // If table doesn't exist or user has no wallet yet -> Return Simulation Data
    // This ensures the UI never breaks during the transition phase.
    logger.warn('User wallet not found or DB error, using simulation data');

    const mockWallet = {
      user_id: user.id,
      balance: 1250.5, // Mock: $1,250
      pending_balance: 150.0, // Mock: $150 pending
      total_earned: 5430.0, // Mock: $5,430 lifetime
      currency: 'USDT',
      is_frozen: false,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: mockWallet,
      source: 'simulation',
    });
  } catch (_error) {
    return NextResponse.json({ success: false, message: 'Internal Error' }, { status: 500 });
  }
}
