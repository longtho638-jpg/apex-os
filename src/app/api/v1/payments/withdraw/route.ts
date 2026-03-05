/**
 * Withdrawal Request API
 *
 * Handles user withdrawal requests
 */

import { type NextRequest, NextResponse } from 'next/server';
import { logAuditEvent } from '@/lib/services/audit-service';
import { createClient } from '@/lib/supabase/server';

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

    const body = await request.json();
    const { amount, currency, method, destination } = body;

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!['bank', 'crypto'].includes(method)) {
      return NextResponse.json({ error: 'Invalid withdrawal method' }, { status: 400 });
    }

    if (!destination || !destination.trim()) {
      return NextResponse.json({ error: 'Destination required' }, { status: 400 });
    }

    // Check wallet balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .eq('currency', currency || 'USD')
      .eq('is_paper', false)
      .single();

    if (!wallet || wallet.balance < amount) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    // Create withdrawal request
    const referenceId = `WD-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id: user.id,
        wallet_id: wallet.id,
        amount,
        currency: currency || 'USD',
        method,
        destination,
        reference_id: referenceId,
        status: 'pending',
      })
      .select()
      .single();

    if (withdrawalError) {
      return NextResponse.json({ error: 'Failed to create withdrawal request' }, { status: 500 });
    }

    // Log the request
    await logAuditEvent({
      userId: user.id,
      action: 'WITHDRAWAL_REQUESTED' as any,
      resourceType: 'WALLET',
      resourceId: wallet.id,
      newValue: { amount, method, referenceId },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      referenceId,
      withdrawal,
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to process withdrawal' }, { status: 500 });
  }
}
