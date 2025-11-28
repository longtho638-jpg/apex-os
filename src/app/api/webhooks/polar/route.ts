import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { WebhookVerificationError, validateEvent } from '@polar-sh/sdk/webhooks';

// Initialize Supabase client with Service Role Key for secure backend operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.text();
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET!;
    const polarSignature = request.headers.get('polar-webhook-signature');
    const polarTimestamp = request.headers.get('polar-webhook-signature-timestamp');
    const polarId = request.headers.get('polar-webhook-id');
    const polarEvent = request.headers.get('polar-webhook-event');

    if (!polarSignature || !polarTimestamp || !polarId || !polarEvent) {
        return NextResponse.json({ error: 'Missing webhook headers' }, { status: 400 });
    }

    // Verify the webhook signature
    try {
        // Polar SDK helper to validate the event
        // Note: Since we are using the raw request body, we pass it directly.
        // The validateEvent function might need specific headers as an object.
        const headers = {
            'polar-webhook-signature': polarSignature,
            'polar-webhook-signature-timestamp': polarTimestamp,
            'polar-webhook-id': polarId,
            'polar-webhook-event': polarEvent,
        };
        
        // Since validateEvent from SDK might be complex to mock or use without full type alignment,
        // we will assume it works or implement manual verification if needed.
        // For now, trusting the SDK's validation logic if available, otherwise standard HMAC.
        // The SDK documentation recommends using `validateEvent`.
        
        validateEvent(requestBody, headers, webhookSecret);
    } catch (error) {
        if (error instanceof WebhookVerificationError) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }
        throw error;
    }

    const event = JSON.parse(requestBody);

    switch (event.type) {
      case 'checkout.created':
        // Optional: log checkout creation
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
        
      case 'subscription.canceled':
        await handleSubscriptionCanceled(event.data);
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
  const { id, customer_email, metadata, amount, currency, product } = data;
  
  // Validate required metadata
  if (!metadata?.userId || !metadata?.tier) {
      console.error('Missing metadata in checkout.completed event');
      return;
  }

  // Create transaction record
  // Idempotency: Using `gateway` and `gateway_transaction_id` unique constraint in DB schema
  const { error } = await supabase.from('payment_transactions').insert({
    user_id: metadata.userId,
    gateway: 'polar',
    gateway_transaction_id: id,
    amount: amount / 100, // Convert cents to dollars if amount is in cents
    currency: currency || 'USD',
    status: 'completed',
    product_name: product?.name || `${metadata.tier} Plan`,
    metadata: { checkout_data: data },
    completed_at: new Date().toISOString()
  });

  if (error) {
      // If duplicate (code 23505), likely already processed. Log info but don't fail webhook.
      if (error.code === '23505') {
          console.log('Transaction already processed:', id);
      } else {
          console.error('Database insert error (transactions):', error);
          throw error;
      }
  }

  // Upsert subscription status
  const { error: subError } = await supabase.from('subscriptions').upsert({
    user_id: metadata.userId,
    tier: metadata.tier,
    status: 'active',
    gateway: 'polar',
    gateway_subscription_id: data.subscription_id || id, // subscription_id might be present if it's a sub checkout
    current_period_start: new Date().toISOString(),
    current_period_end: getNextBillingDate(),
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' }); // Update existing subscription for this user

  if (subError) {
      console.error('Database upsert error (subscriptions):', subError);
      throw subError;
  }
}

async function handleSubscriptionCreated(data: any) {
    const { id, metadata, current_period_start, current_period_end, status } = data;
    
    if (!metadata?.userId) return;

    await supabase.from('subscriptions').upsert({
        user_id: metadata.userId,
        tier: metadata.tier || 'FOUNDERS', // Fallback or fetch from product
        status: mapPolarStatus(status),
        gateway: 'polar',
        gateway_subscription_id: id,
        current_period_start: current_period_start ? new Date(current_period_start).toISOString() : undefined,
        current_period_end: current_period_end ? new Date(current_period_end).toISOString() : undefined,
        updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
}

async function handleSubscriptionUpdated(data: any) {
    // Similar to created, update status and period
    await handleSubscriptionCreated(data);
}

async function handleSubscriptionCanceled(data: any) {
    const { id, metadata, cancel_at_period_end } = data;
    
    if (!metadata?.userId) return;

    await supabase.from('subscriptions').update({
        status: 'cancelled', // or 'past_due' depending on logic
        cancel_at_period_end: cancel_at_period_end,
        updated_at: new Date().toISOString()
    }).eq('gateway_subscription_id', id);
}

function getNextBillingDate(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}

function mapPolarStatus(polarStatus: string): string {
    // Map Polar status to our enum ('active', 'cancelled', 'past_due', 'trialing')
    switch (polarStatus) {
        case 'active': return 'active';
        case 'canceled': return 'cancelled';
        case 'incomplete': return 'past_due';
        case 'incomplete_expired': return 'cancelled';
        case 'past_due': return 'past_due';
        case 'trialing': return 'trialing';
        default: return 'active';
    }
}
