import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

function verifyPolarWebhook(payload: string, signature: string): boolean {
  const secret = process.env.POLAR_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  const signatureBuffer = Buffer.from(signature.startsWith('whsec_') ? signature.substring(6) : signature);
  const digestBuffer = Buffer.from(digest);

  if (signatureBuffer.length !== digestBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, digestBuffer);
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('polar-webhook-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 401 });
    }

    if (!verifyPolarWebhook(payload, signature)) {
      logger.error('Polar signature mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(payload);

    switch (event.type) {
      case 'checkout.created':
        break;

      case 'checkout.completed':
        await handleCheckoutCompleted(event.data);
        break;

      case 'order.created':
        await handleOrderCreated(event.data);
        break;

      default:
        logger.info(`Unhandled Polar event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Polar webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

/**
 * RaaS: Checkout = one-time deposit/credit purchase (not subscription).
 * Credits go to user wallet for trading capital or marketplace purchases.
 */
async function handleCheckoutCompleted(data: Record<string, unknown>) {
  const { id, customer_email, metadata, amount, currency } = data as {
    id: string;
    customer_email: string;
    metadata: { userId?: string; type?: string };
    amount: number;
    currency: string;
  };

  if (!metadata?.userId) {
    logger.warn('Missing userId in Polar checkout metadata, skipping');
    return;
  }

  // Record payment transaction
  const { error: txError } = await supabase.from('payment_transactions').insert({
    user_id: metadata.userId,
    gateway: 'polar',
    gateway_transaction_id: id,
    amount: amount / 100,
    currency,
    status: 'completed',
    product_name: metadata.type || 'wallet_deposit',
    metadata: { checkout_data: data },
    completed_at: new Date().toISOString(),
  });

  if (txError) {
    if (txError.code === '23505') {
      logger.warn(`Duplicate Polar transaction ignored: ${id}`);
      return;
    }
    logger.error('Error inserting Polar transaction:', txError);
    throw new Error('Failed to insert transaction');
  }

  // Credit user wallet (RaaS: no subscription, direct wallet credit)
  await supabase.rpc('credit_user_balance_realtime', {
    p_user_id: metadata.userId,
    p_amount: amount / 100,
    p_source: 'polar_deposit',
    p_metadata: { gateway_tx_id: id, email: customer_email },
  });

  // Auto-claim any pending vault funds
  const { error: claimError } = await supabase.rpc('claim_pending_vault_funds', {
    p_user_id: metadata.userId,
  });

  if (claimError) logger.error('Error claiming pending funds:', claimError);
}

/**
 * RaaS: Order = marketplace strategy/agent purchase.
 */
async function handleOrderCreated(data: Record<string, unknown>) {
  const { id, metadata } = data as {
    id: string;
    metadata: { userId?: string; productType?: string };
  };

  if (!metadata?.userId) return;

  logger.info(`[Polar] Order ${id} for user ${metadata.userId}, type: ${metadata.productType}`);
}
