import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { eventBus } from '@/lib/agent/event-bus';
import { logger } from '@/lib/logger';
import { CreateOrderSchema } from '@/lib/validations/trade';
import { applyRateLimit } from '@/middleware/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limit
    const rateResponse = await applyRateLimit(request);
    if (rateResponse) return rateResponse;

    // 2. Auth & Setup
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role for order insertion to ensure consistent state
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    // 3. Validation
    const body = await request.json();
    const validation = CreateOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid order parameters',
          errors: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const orderData = validation.data;

    // 4. Pre-flight Check (Balance)
    // Ideally, this is done via a stored procedure to lock rows, but for now we check simply.
    // Depending on Side (Buy = need Quote Currency, Sell = need Base Currency)
    // We'll skip complex balance check here and let the Matching Engine / Guardian reject it if insufficient.
    // OR we can do a quick check:

    // 5. Insert Order
    // Handle OCO (One Cancels Other) - creates 2 orders linked by group_id
    if (orderData.type === 'oco') {
      // Implementation for OCO is complex, let's handle standard first
      // For now, reject OCO until engine supports it fully
      return NextResponse.json({ success: false, message: 'OCO orders coming soon' }, { status: 501 });
    }

    // Resolve org context if user belongs to an org
    const { data: membership } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    const { data: order, error: dbError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        org_id: membership?.org_id || null,
        symbol: orderData.symbol,
        side: orderData.side,
        type: orderData.type,
        quantity: orderData.quantity,
        price: orderData.price, // Nullable
        stop_price: orderData.stop_price, // Nullable
        status: 'pending',
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // 6. Publish Event for Matching Engine
    await eventBus.publish('TRADE_REQUEST', 'api_gateway', {
      order_id: order.id,
      user_id: user.id,
      ...orderData,
    });

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      order_id: order.id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    logger.error('Order placement error:', error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
