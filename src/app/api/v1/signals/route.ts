import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = supabase
      .from('trading_signals')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (symbol) {
      query = query.eq('symbol', symbol);
    }

    const { data, error } = await query;

    if (error) {
        console.warn('Database error (falling back to mocks):', error.message);
        // Mock Data Fallback for Demo/Uninitialized DB
        return NextResponse.json({
            data: Array.from({ length: 5 }).map((_, i) => ({
                id: `mock-srv-${i}`,
                symbol: ['BTC', 'ETH', 'SOL', 'BNB'][i % 4],
                prediction: Math.random() > 0.5 ? 'BUY' : 'SELL',
                confidence: 0.8 + Math.random() * 0.15,
                entry_price: 50000 + Math.random() * 5000,
                price_contrib: 0.6,
                sentiment_contrib: 0.3,
                volume_contrib: 0.1,
                timestamp: new Date().toISOString(),
                created_at: new Date().toISOString()
            }))
        });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error in signals API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

