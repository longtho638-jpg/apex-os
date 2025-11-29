import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-nowpayments-sig');

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 401 });
    }

    const secret = process.env.NOWPAYMENTS_IPN_SECRET;
    if (!secret) {
      console.error('NOWPAYMENTS_IPN_SECRET not set');
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    // Verify Signature
    // Sort keys alphabetically and stringify
    const sortedKeys = Object.keys(body).sort();
    const hmac = crypto.createHmac('sha512', secret);
    hmac.update(JSON.stringify(body, sortedKeys));
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== signature) {
      console.error('Signature mismatch', { expected: generatedSignature, received: signature });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { order_id, payment_status, price_amount } = body;

    // order_id format: TIER_USERID_TIMESTAMP
    const parts = order_id.split('_');
    if (parts.length < 3) {
      console.error('Invalid order_id format:', order_id);
      return NextResponse.json({ received: true });
    }

    const tier = parts[0];
    const userId = parts[1];

    if (payment_status === 'finished' || payment_status === 'confirmed') {
      // Create Transaction
      await supabase.from('payment_transactions').insert({
        user_id: userId,
        gateway: 'nowpayments',
        gateway_transaction_id: body.payment_id || order_id,
        amount: price_amount,
        currency: 'USD',
        status: 'completed',
        product_name: `${tier} Plan`,
        metadata: { webhook_data: body },
        completed_at: new Date().toISOString()
      });

      // Update Subscription
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        tier: tier,
        status: 'active',
        gateway: 'nowpayments',
        gateway_subscription_id: order_id,
        current_period_start: new Date().toISOString(),
        current_period_end: getNextBillingDate()
      }, { onConflict: 'user_id, status' }); // Note: using composite key logic implicitly or explicit constraint

      // Auto-claim any pending missed commissions (Grace Period Reward)
      const { error: claimError } = await supabase.rpc('claim_pending_vault_funds', {
        p_user_id: userId
      });

      if (claimError) console.error('Error claiming pending funds:', claimError);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('NOWPayments webhook error:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

function getNextBillingDate(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}
