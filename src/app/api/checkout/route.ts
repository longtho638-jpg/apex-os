import {
  createNOWPaymentsInvoice,
  createPolarCheckout,
  getTierPrice,
  type PaymentTier,
  type TierId,
} from '@apex-os/vibe-payment';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { applyDiscount } from '@/lib/discount-engine';
import { logger } from '@/lib/logger';
import { redis } from '@/lib/redis';

const checkoutSchema = z.object({
  tier: z.enum(['EXPLORER', 'OPERATOR', 'ARCHITECT', 'SOVEREIGN']),
  gateway: z.enum(['polar', 'nowpayments', 'wallet']),
  userEmail: z.string().email(),
  discountCode: z.string().optional().nullable(),
  billingPeriod: z.enum(['monthly', 'annual']).optional().default('monthly'),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Idempotency Check
    const idempotencyKey = request.headers.get('idempotency-key');
    if (!idempotencyKey) {
      return NextResponse.json({ error: 'Idempotency-Key header is required' }, { status: 400 });
    }

    const cachedResponse = await redis.get(`idempotency:${idempotencyKey}`);
    if (cachedResponse) {
      logger.info(`[Idempotency] Returning cached response for key: ${idempotencyKey}`);
      return NextResponse.json(JSON.parse(cachedResponse));
    }

    const body = await request.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error }, { status: 400 });
    }

    const { tier, gateway, userEmail, discountCode, billingPeriod } = result.data;

    // Get userId from session (implement proper auth in real app)
    const userId = request.headers.get('x-user-id') || 'user_123';

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get base price based on billing period
    const originalPrice = getTierPrice(tier as TierId, billingPeriod);

    // Apply discount if provided
    let finalPrice = originalPrice;
    let savedAmount = 0;

    if (discountCode) {
      const discountResult = await applyDiscount(originalPrice, discountCode, tier, userId);
      finalPrice = discountResult.finalPrice as any;
      savedAmount = discountResult.saved;
    }

    let responseData: any;

    if (gateway === 'wallet') {
      // Call RPC to pay with wallet
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

      const { data, error } = await supabase.rpc('pay_with_wallet', {
        p_user_id: userId,
        p_amount: finalPrice,
        p_tier: tier,
        p_billing_period: billingPeriod,
      });

      if (error) {
        logger.error('Wallet payment error:', error);
        return NextResponse.json({ error: 'Wallet payment failed' }, { status: 500 });
      }

      const result = data as any;

      if (!result || !result.success) {
        return NextResponse.json(
          { error: result?.message || 'Insufficient balance or payment failed' },
          { status: 400 },
        );
      }

      responseData = {
        success: true,
        finalPrice,
        saved: savedAmount,
        message: 'Payment successful',
      };
    } else if (gateway === 'polar') {
      const checkout = await createPolarCheckout({
        userId,
        userEmail,
        tier: tier as PaymentTier,
      });

      responseData = {
        checkoutUrl: checkout.url,
        checkoutId: checkout.id,
        finalPrice,
        saved: savedAmount,
      };
    } else {
      const invoice = await createNOWPaymentsInvoice({
        userId,
        tier: tier as PaymentTier,
        amountOverride: finalPrice,
      });

      responseData = {
        checkoutUrl: invoice.invoice_url,
        orderId: invoice.order_id,
        finalPrice,
        saved: savedAmount,
      };
    }

    // Cache success response
    await redis.set(`idempotency:${idempotencyKey}`, JSON.stringify(responseData), 'EX', 86400); // 24 hours

    return NextResponse.json(responseData);
  } catch (error) {
    logger.error('Checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
