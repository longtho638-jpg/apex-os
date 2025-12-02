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
        // Get user info from Supabase
        const authHeader = request.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');

        // CRITICAL SECURITY FIX: Use user token instead of Service Role Key to enforce RLS
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            }
        );
        // CRITICAL SECURITY FIX: Ignore 'userId' param to prevent IDOR.
        // Always use the authenticated user's ID from the token.
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        const userId = user.id;

        const status = request.nextUrl.searchParams.get('status');
        const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
        const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '20'), 100); // Max 100
        const offset = (page - 1) * limit;

        // Fetch orders from database
        let query = supabase
            .from('orders')
            .select('id, symbol, side, type, quantity, price, status, created_at', { count: 'exact' })
            .eq('user_id', userId) // Enforce RLS/Owner check
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status) query = query.eq('status', status);

        const { data: orders, error, count } = await query;

        if (error) {
            console.error('[Trading Orders API] Supabase fetch error:', error);
            // If table doesn't exist, return empty array instead of error
            if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
                console.warn('[Trading Orders API] Orders table does not exist, returning empty array');
                return NextResponse.json({ success: true, orders: [], message: 'Orders table not found' });
            }
            throw error;
        }

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
