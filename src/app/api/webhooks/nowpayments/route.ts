import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-nowpayments-sig');

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 401 });
    }

    const secret = process.env.NOWPAYMENTS_IPN_SECRET;
    if (!secret) {
      logger.error('NOWPAYMENTS_IPN_SECRET not set');
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    // Verify signature (SHA-512 HMAC with sorted keys)
    const sortedKeys = Object.keys(body).sort();
    const hmac = crypto.createHmac('sha512', secret);
    hmac.update(JSON.stringify(body, sortedKeys));
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== signature) {
      logger.error('NOWPayments signature mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { order_id, payment_status, price_amount } = body;

    // order_id format: TYPE_USERID_TIMESTAMP
    const parts = order_id.split('_');
    if (parts.length < 3) {
      logger.error('Invalid order_id format:', order_id);
      return NextResponse.json({ received: true });
    }

    const depositType = parts[0]; // e.g. 'DEPOSIT', 'TRADE_CAPITAL'
    const userId = parts[1];

    if (payment_status === 'finished' || payment_status === 'confirmed') {
      // Record payment transaction
      await supabase.from('payment_transactions').insert({
        user_id: userId,
        gateway: 'nowpayments',
        gateway_transaction_id: body.payment_id || order_id,
        amount: price_amount,
        currency: 'USD',
        status: 'completed',
        product_name: `crypto_deposit_${depositType.toLowerCase()}`,
        metadata: { webhook_data: body },
        completed_at: new Date().toISOString(),
      });

      // RaaS: Credit user wallet directly (no subscription)
      await supabase.rpc('credit_user_balance_realtime', {
        p_user_id: userId,
        p_amount: price_amount,
        p_source: 'nowpayments_deposit',
        p_metadata: { gateway_tx_id: body.payment_id, type: depositType },
      });

      // Auto-claim any pending vault funds
      const { error: claimError } = await supabase.rpc('claim_pending_vault_funds', {
        p_user_id: userId,
      });

      if (claimError) logger.error('Error claiming pending funds:', claimError);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('NOWPayments webhook error:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
