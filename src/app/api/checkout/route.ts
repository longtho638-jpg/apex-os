import { NextRequest, NextResponse } from 'next/server';
import { createPolarCheckout } from '@/lib/payments/polar-client';
import { createBinancePayOrder } from '@/lib/payments/binance-pay-client';
import { z } from 'zod';
import { PAYMENT_TIERS } from '@/config/payment-tiers';

// Define schema using the keys from PAYMENT_TIERS
const tiersEnum = z.enum(Object.keys(PAYMENT_TIERS) as [string, ...string[]]);

const checkoutSchema = z.object({
  tier: tiersEnum,
  gateway: z.enum(['polar', 'binance_pay']),
  userEmail: z.string().email()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json(
            { error: 'Invalid request parameters', details: validation.error.issues },
            { status: 400 }
        );
    }

    const { tier, gateway, userEmail } = validation.data;
    
    // Get userId from session (implement proper auth)
    // In a real app, use Supabase Auth helper: const { data: { user } } = await supabase.auth.getUser();
    // For now, checking header as per plan
    const userId = request.headers.get('x-user-id'); 
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing User ID' },
        { status: 401 }
      );
    }

    if (gateway === 'polar') {
      const checkout = await createPolarCheckout({
        userId,
        userEmail,
        tier: tier as keyof typeof PAYMENT_TIERS
      });
      
      return NextResponse.json({
        checkoutUrl: checkout.url,
        checkoutId: checkout.id
      });
    } else {
      const order = await createBinancePayOrder({
        userId,
        userEmail,
        tier: tier as keyof typeof PAYMENT_TIERS
      });
      
      return NextResponse.json({
        checkoutUrl: order.checkoutUrl,
        orderId: order.orderId,
        prepayId: order.prepayId
      });
    }
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: 500 }
    );
  }
}
