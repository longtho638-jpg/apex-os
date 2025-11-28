import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';


// POST - Create order
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { symbol, type, side, quantity, price, userId } = body;

        // Validate inputs
        if (!symbol || !type || !side || !quantity || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Dynamically import TradingService to avoid module-level errors affecting GET
        const { TradingService } = await import('@backend/services/trading');
        const tradingService = new TradingService();
        const result = await tradingService.placeOrder(userId, symbol, side, quantity, price, type);

        return NextResponse.json({
            success: true,
            ...result
        });

    } catch (error: any) {
        console.error('Order creation error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to create order'
        }, { status: 500 });
    }
}

// GET - List orders
export async function GET(request: NextRequest) {
    try {
        console.log('[Trading Orders API] GET request received');

        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!url || !key) {
            console.error('[Trading Orders API] Missing Supabase credentials');
            return NextResponse.json({
                success: true,
                orders: [], // Return empty array instead of error for missing credentials
                message: 'Database not configured'
            });
        }

        const supabase = createClient(url, key);
        const userId = request.nextUrl.searchParams.get('userId');
        const status = request.nextUrl.searchParams.get('status');

        console.log('[Trading Orders API] Fetching orders with filters:', { userId, status });

        let query = supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (userId) query = query.eq('user_id', userId);
        if (status) query = query.eq('status', status);

        const { data: orders, error } = await query.limit(100);

        if (error) {
            console.error('[Trading Orders API] Supabase fetch error:', error);
            // If table doesn't exist, return empty array instead of error
            if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
                console.warn('[Trading Orders API] Orders table does not exist, returning empty array');
                return NextResponse.json({ success: true, orders: [], message: 'Orders table not found' });
            }
            throw error;
        }

        console.log('[Trading Orders API] Successfully fetched', orders?.length || 0, 'orders');
        return NextResponse.json({ success: true, orders: orders || [] });

    } catch (error: any) {
        console.error('[Trading Orders API] GET error:', error);
        return NextResponse.json({
            success: false,
            orders: [],
            error: error.message
        }, { status: 500 });
    }
}
