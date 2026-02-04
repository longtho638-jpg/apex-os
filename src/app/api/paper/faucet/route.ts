/**
 * Paper Trading Faucet API
 *
 * Allows users to add demo funds to their paper trading account
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { logAuditEvent } from '@/lib/services/audit-service';

const FAUCET_AMOUNT = 10000; // $10k USD
const FAUCET_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is in paper trading mode
    const { data: profile } = await supabase
      .from('users')
      .select('trading_mode')
      .eq('id', user.id)
      .single();

    if (profile?.trading_mode !== 'paper') {
      return NextResponse.json(
        { error: 'Faucet only available in paper trading mode' },
        { status: 403 }
      );
    }

    // Check cooldown (rate limiting)
    const { data: lastClaim } = await supabase
      .from('audit_logs')
      .select('created_at')
      .eq('user_id', user.id)
      .eq('action', 'PAPER_FAUCET_CLAIMED')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lastClaim) {
      const timeSinceLastClaim = Date.now() - new Date(lastClaim.created_at).getTime();
      if (timeSinceLastClaim < FAUCET_COOLDOWN_MS) {
        const remainingMinutes = Math.ceil((FAUCET_COOLDOWN_MS - timeSinceLastClaim) / 1000 / 60);
        return NextResponse.json(
          { error: `Faucet on cooldown. Try again in ${remainingMinutes} minutes.` },
          { status: 429 }
        );
      }
    }

    // Get or create paper wallet
    let { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .eq('currency', 'USD')
      .eq('is_paper', true)
      .single();

    if (walletError || !wallet) {
      // Create paper wallet
      const { data: newWallet, error: createError } = await supabase
        .from('wallets')
        .insert({
          user_id: user.id,
          currency: 'USD',
          balance: FAUCET_AMOUNT,
          is_paper: true,
        })
        .select()
        .single();

      if (createError || !newWallet) {
        return NextResponse.json(
          { error: 'Failed to create paper wallet' },
          { status: 500 }
        );
      }

      wallet = newWallet;
    } else {
      // Add to existing balance
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: (wallet.balance || 0) + FAUCET_AMOUNT })
        .eq('id', wallet.id);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to add funds' },
          { status: 500 }
        );
      }

      wallet.balance = (wallet.balance || 0) + FAUCET_AMOUNT;
    }

    // Log faucet claim
    await logAuditEvent({
      userId: user.id,
      action: 'PAPER_FAUCET_CLAIMED' as any,
      resourceType: 'WALLET',
      resourceId: wallet.id,
      newValue: { amount: FAUCET_AMOUNT, newBalance: wallet.balance },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      amount: FAUCET_AMOUNT,
      newBalance: wallet.balance,
    });
  } catch (error) {
    console.error('[PaperFaucet] Error:', error);
    return NextResponse.json(
      { error: 'Failed to claim faucet' },
      { status: 500 }
    );
  }
}
