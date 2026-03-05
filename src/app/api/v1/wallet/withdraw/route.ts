import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { agentCheckWithdrawal } from '@/lib/agents/withdrawal-agent';
import { logger } from '@/lib/logger';

// Helper to validate Tron address (Basic regex check)
// Starts with T, 34 chars long, base58 characters
function _isValidTronAddress(address: string): boolean {
  return /^T[a-zA-Z0-9]{33}$/.test(address);
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate User & Enforce RLS
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Initialize Supabase with USER TOKEN
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Verify Token & Get User ID
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }

    const user_id = user.id; // STRICTLY use ID from token

    // 2. Compliance Check: KYC Verification
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('kyc_status')
      .eq('id', user_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    if (profile.kyc_status !== 'verified') {
      return NextResponse.json(
        {
          error: 'KYC Verification Required',
          message: 'Please complete identity verification to withdraw funds.',
          current_status: profile.kyc_status,
        },
        { status: 403 },
      );
    }

    const body = await req.json();

    // Zod Schema Validation
    const withdrawSchema = z.object({
      amount: z.number().positive('Amount must be positive').min(10, 'Minimum withdrawal is $10'),
      crypto_address: z.string().regex(/^T[a-zA-Z0-9]{33}$/, 'Invalid USDT TRC20 address'),
    });

    const validation = withdrawSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { amount, crypto_address } = validation.data;

    // 3. Create Checksum (CRITICAL for Fraud Prevention)
    // We bind the request data to a hash. If database is tampered, this hash won't match.
    const _timestamp = new Date().toISOString(); // We'll use the DB timestamp ideally, but close enough for verify
    // Actually, we let the DB set the timestamp, but we need a unique verifiable string.
    // Let's use a nonce or just hash the intent.
    const nonce = crypto.randomBytes(16).toString('hex');

    // Hash: sha256(user_id + amount + address + nonce + SECRET)
    // Using a server-side secret salt makes it impossible for DB admins to forge without code access
    const checksum = crypto
      .createHash('sha256')
      .update(`${user_id}:${amount}:${crypto_address}:${nonce}:${process.env.SUPABASE_JWT_SECRET}`)
      .digest('hex');

    // 4. Create Withdrawal Request
    const { data: request, error: insertError } = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id,
        amount,
        crypto_address,
        currency: 'USDT',
        network: 'TRC20',
        status: 'pending',
        data_checksum: checksum,
        agent_notes: `nonce:${nonce}`, // Store nonce to verify later
      })
      .select()
      .single();

    if (insertError) {
      logger.error('Withdrawal Insert Error:', insertError);
      return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
    }

    // 5. Reserve Balance (Atomic Transaction via RPC)
    const { data: reserved, error: reserveError } = await supabase.rpc('reserve_balance_for_withdrawal', {
      p_user_id: user_id,
      p_amount: amount,
      p_withdrawal_id: request.id,
    });

    if (reserveError || !reserved) {
      // Rollback request if reservation fails (e.g. insufficient funds)
      await supabase.from('withdrawal_requests').delete().eq('id', request.id);
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // 6. Trigger Agent Check (AI Eye 1)
    // We await this for MVP to ensure immediate feedback, but in high-scale prod this should be a background job.
    const agentResult = await agentCheckWithdrawal(request.id);

    return NextResponse.json({
      success: true,
      request_id: request.id,
      status: agentResult.approved ? 'agent_approved' : 'flagged',
      risk_score: agentResult.risk_score,
      message: agentResult.approved ? 'Passed AI check. Waiting for Admin approval.' : 'Flagged for manual review.',
    });
  } catch (error: any) {
    logger.error('Withdrawal Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
