import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyApiKey } from '@/lib/auth/api-key';
import { CreateOrderSchema } from '@/lib/validations/trade';
import { eventBus } from '@/lib/agent/event-bus';

export async function POST(request: NextRequest) {
    const start = performance.now();
    try {
        // 1. Auth (API Key)
        const authResult = await verifyApiKey(request);
        if (!authResult.success) {
            return NextResponse.json(
                { success: false, message: authResult.error },
                { status: authResult.status }
            );
        }

        // 2. Parse Body
        const body = await request.json();
        
        // 3. Validation (Zod)
        const validation = CreateOrderSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: 'Invalid order parameters',
                errors: validation.error.issues
            }, { status: 400 });
        }
        const orderData = validation.data;

        // 4. DB Insertion (Service Role for speed/bypass RLS overhead if needed, but RLS is safer)
        // Using Service Key here because 'api_keys' check authenticated the user already.
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: order, error: dbError } = await supabase
            .from('orders')
            .insert({
                user_id: authResult.userId,
                symbol: orderData.symbol,
                side: orderData.side,
                type: orderData.type,
                quantity: orderData.quantity,
                price: orderData.price,
                stop_price: orderData.stop_price,
                status: 'pending'
            })
            .select('id, status') // Select minimal fields for speed
            .single();

        if (dbError) throw dbError;

        // 5. Publish Event (Async - don't await if we want extreme speed? No, reliability first)
        await eventBus.publish('TRADE_REQUEST', 'inst_api', {
            order_id: order.id,
            user_id: authResult.userId,
            ...orderData
        });

        const duration = performance.now() - start;

        return NextResponse.json({
            success: true,
            order_id: order.id,
            status: order.status,
            latency_ms: duration.toFixed(2)
        });

    } catch (error: any) {
        logger.error('Institutional Trade Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal Error' },
            { status: 500 }
        );
    }
}
