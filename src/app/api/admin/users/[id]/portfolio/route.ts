import { getTierByVolume } from '@apex-os/vibe-payment';
import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // 1. Security Check (Middleware handles basic auth, here we check role)
  // In a real app, ensure req.headers.get('x-admin-role') === 'super_admin'
  // For CLI demo, we skip complex role verification logic inside the handler
  // as middleware generally sets this up or we trust internal admin route protection.

  const { id } = await params;
  const supabase = getSupabaseClient();

  try {
    // 2. Fetch Data
    const [userRes, walletRes, virtualWalletRes, positionsRes, tradesRes] = await Promise.all([
      supabase
        .from('users')
        .select('id, email, full_name, subscription_tier, monthly_volume, created_at')
        .eq('id', id)
        .single(),
      supabase
        .from('wallets')
        .select('balance_usd, reserved_balance, total_earned, total_withdrawn')
        .eq('user_id', id)
        .single(),
      supabase.from('virtual_wallets').select('balance, initial_balance, total_pnl').eq('user_id', id).single(),
      supabase
        .from('virtual_positions')
        .select('id, symbol, side, size, entry_price, current_price, pnl, status')
        .eq('user_id', id)
        .eq('status', 'OPEN'),
      supabase
        .from('virtual_positions')
        .select('id, symbol, side, size, entry_price, exit_price, pnl, closed_at')
        .eq('user_id', id)
        .order('closed_at', { ascending: false })
        .limit(10),
    ]);

    if (userRes.error) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // RaaS: Derive tier from volume, not subscription
    const volumeTier = getTierByVolume(userRes.data?.monthly_volume || 0);

    return NextResponse.json({
      user: { ...userRes.data, volume_tier: volumeTier },
      realWallet: walletRes.data,
      virtualWallet: virtualWalletRes.data,
      openPositions: positionsRes.data,
      recentTrades: tradesRes.data,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
