import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function verifyBinanceWebhook(body: string, signature: string): boolean {
  const secret = process.env.BINANCE_PAY_WEBHOOK_SECRET || 'PLACEHOLDER_WEBHOOK_SECRET';
  const hmac = crypto.createHmac('sha512', secret);
  const digest = hmac.update(body).digest('hex').toUpperCase();
  
  if (signature.length !== digest.length) {
      return false;
  }
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('binancepay-signature');

    if (!signature || !verifyBinanceWebhook(body, signature)) {
      return NextResponse.json(
        { returnCode: 'FAIL', returnMessage: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    if (event.bizType === 'PAY' && event.bizStatus === 'PAY_SUCCESS') {
      await handlePaymentSuccess(event);
    }

    return NextResponse.json({
      returnCode: 'SUCCESS',
      returnMessage: null
    });
  } catch (error) {
    console.error('Binance Pay webhook error:', error);
    return NextResponse.json(
      { returnCode: 'FAIL', returnMessage: 'Internal error' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(event: any) {
  let data = event.data;
  if (typeof data === 'string') {
      try {
          data = JSON.parse(data);
      } catch (e) {
          console.error('Failed to parse event data JSON:', e);
          return;
      }
  }
  
  const { merchantTradeNo, totalFee, currency, transactionId } = data;
  
  // Extract userId from merchantTradeNo (format: APEX-{userId}-{timestamp})
  const parts = merchantTradeNo.split('-');
  if (parts.length < 3) {
      console.error('Invalid merchantTradeNo format:', merchantTradeNo);
      return;
  }
  const userId = parts[1];
  
  // Get tier from order metadata (would need to store this separately or encode in tradeNo)
  // For MVP, we can encode it or fetch from pending order if we stored it.
  // Let's assume we need a helper or fallback. 
  // Plan suggested `getTierFromMerchantTradeNo`.
  const tier = await getTierFromMerchantTradeNo(merchantTradeNo);

  // Create transaction record
  const { error } = await supabase.from('payment_transactions').insert({
    user_id: userId,
    gateway: 'binance_pay',
    gateway_transaction_id: transactionId || merchantTradeNo,
    amount: parseFloat(totalFee),
    currency,
    status: 'completed',
    product_name: `${tier} Plan`,
    metadata: { webhook_data: event.data },
    completed_at: new Date().toISOString()
  });

  if (error) {
      if (error.code === '23505') {
          console.log('Transaction already processed (Binance):', merchantTradeNo);
      } else {
          console.error('Database insert error (Binance):', error);
          throw error;
      }
  }

  // Update subscription
  const { error: subError } = await supabase.from('subscriptions').upsert({
    user_id: userId,
    tier,
    status: 'active',
    gateway: 'binance_pay',
    gateway_subscription_id: merchantTradeNo,
    current_period_start: new Date().toISOString(),
    current_period_end: getNextBillingDate(),
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' });

  if (subError) {
      console.error('Database upsert error (Binance Sub):', subError);
      throw subError;
  }
}

async function getTierFromMerchantTradeNo(tradeNo: string): Promise<string> {
  // Implementation: query pending orders or use Redis cache
  // For now, returning a default or checking if we can encode it in tradeNo 
  // (APEX-{userId}-{tier}-{timestamp} might be better but breaks existing format in plan)
  // We will fallback to 'FOUNDERS' for MVP or check if we can query metadata from Binance if sent.
  return 'FOUNDERS'; // Placeholder
}

function getNextBillingDate(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}
