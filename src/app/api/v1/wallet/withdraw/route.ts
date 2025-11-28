import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Helper to validate Tron address (Basic regex check)
// Starts with T, 34 chars long, base58 characters
function isValidTronAddress(address: string): boolean {
  return /^T[a-zA-Z0-9]{33}$/.test(address);
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate User
    // In a real Next.js App Router with Supabase Auth helper:
    // const supabase = createRouteHandlerClient({ cookies });
    // const { data: { session } } = await supabase.auth.getSession();
    
    // For this implementation, we'll assume we extract the user ID from a trusted header or session mock
    // Since we can't use the full auth helper stack easily in this CLI context without more setup,
    // we'll instantiate a standard client and assume the ID is passed securely or retrieved via standard means.
    // CRITICAL: In production, use strict session validation.
    
    // Mock Auth for MVP flow (Replace with real auth middleware)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    // We'll instantiate Supabase with Service Role for admin actions (like checking balance for update)
    // BUT for RLS we should use the user's context. 
    // Let's assume we use the service role to orchestrate the sensitive checksum logic safely on server.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await req.json();
    const { user_id, amount, crypto_address } = body; // In prod, get user_id from session

    // 2. Validate Inputs
    if (!user_id || !amount || !crypto_address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (amount < 10) {
      return NextResponse.json({ error: 'Minimum withdrawal is $10' }, { status: 400 });
    }

    if (!isValidTronAddress(crypto_address)) {
      return NextResponse.json({ error: 'Invalid USDT TRC20 address' }, { status: 400 });
    }

    // 3. Create Checksum (CRITICAL for Fraud Prevention)
    // We bind the request data to a hash. If database is tampered, this hash won't match.
    const timestamp = new Date().toISOString(); // We'll use the DB timestamp ideally, but close enough for verify
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
        agent_notes: `nonce:${nonce}` // Store nonce to verify later
      })
      .select()
      .single();

    if (insertError) {
      console.error('Withdrawal Insert Error:', insertError);
      return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
    }

    // 5. Reserve Balance (Atomic Transaction via RPC)
    const { data: reserved, error: reserveError } = await supabase.rpc('reserve_balance_for_withdrawal', {
      p_user_id: user_id,
      p_amount: amount,
      p_withdrawal_id: request.id
    });

    if (reserveError || !reserved) {
      // Rollback request if reservation fails (e.g. insufficient funds)
      await supabase.from('withdrawal_requests').delete().eq('id', request.id);
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // 6. Trigger Agent Check (Async)
    // In production, push to Queue. Here we can fire-and-forget or call function.
    // We'll call the agent logic directly for MVP simplicity via an internal API or function call.
    // Let's assume we have an endpoint or import the agent function.
    // To keep this route clean, we'll just return success and let the background worker pick it up
    // OR trigger it explicitly if we want instant feedback for testing.
    
    // See Phase 3 Step 2 for agent implementation. We'll implement it next.

    return NextResponse.json({
      success: true,
      request_id: request.id,
      status: 'pending_review',
      message: 'Withdrawal submitted for agent review'
    });

  } catch (error: any) {
    console.error('Withdrawal Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
