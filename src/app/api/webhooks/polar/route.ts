import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function verifyPolarWebhook(payload: string, signature: string): boolean {
  const secret = process.env.POLAR_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  // Prevent timing attacks
  const signatureBuffer = Buffer.from(signature.startsWith('whsec_') ? signature.substring(6) : signature);
  const digestBuffer = Buffer.from(digest);

  // In case lengths are different (shouldn't happen with correct sigs but good for safety)
  if (signatureBuffer.length !== digestBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, digestBuffer);
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('polar-webhook-signature');
    // Note: Check actual header name from Polar docs, sometimes it's 'Polar-Webhook-Signature'

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 401 }
      );
    }

    // CRITICAL SECURITY FIX: Strictly verify signature
    if (!verifyPolarWebhook(payload, signature)) {
      console.error('Polar signature mismatch');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(payload);

    switch (event.type) {
      case 'checkout.created':
        // Optional: Log checkout creation
        break;

      case 'checkout.completed':
        await handleCheckoutCompleted(event.data);
        break;

      case 'subscription.created':
        await handleSubscriptionCreated(event.data);
        break;

      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Polar webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(data: any) {
  const { id, customer_email, metadata, amount, currency } = data;

  // Create transaction record
  const { error: txError } = await supabase.from('payment_transactions').insert({
    user_id: metadata.userId,
    gateway: 'polar',
    gateway_transaction_id: id,
    amount: amount / 100, // Convert cents to dollars
    currency,
    status: 'completed',
    product_name: `${metadata.tier} Plan`,
    metadata: { checkout_data: data },
    completed_at: new Date().toISOString()
  });

  if (txError) console.error('Error inserting transaction:', txError);

  // Update user subscription
  const { error: subError } = await supabase.from('subscriptions').upsert({
    user_id: metadata.userId,
    tier: metadata.tier,
    status: 'active',
    gateway: 'polar',
    gateway_subscription_id: id, // Using checkout ID as sub ID initially, or extract sub ID if available
    current_period_start: new Date().toISOString(),
    current_period_end: getNextBillingDate()
  }, { onConflict: 'user_id, status' }); // Note: Check your unique constraints

  if (subError) console.error('Error updating subscription:', subError);

  // Auto-claim any pending missed commissions (Grace Period Reward)
  const { error: claimError } = await supabase.rpc('claim_pending_vault_funds', {
    p_user_id: metadata.userId
  });

  if (claimError) console.error('Error claiming pending funds:', claimError);
}

async function handleSubscriptionCreated(data: any) {
  // Logic to handle new subscription creation if different from checkout.completed
}

async function handleSubscriptionUpdated(data: any) {
  // Logic to handle renewals or cancellations
}

function getNextBillingDate(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}