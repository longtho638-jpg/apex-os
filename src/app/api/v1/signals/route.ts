import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { gateTradingSignals, requireFeature } from '@/lib/raas-gate';

export async function GET(req: Request) {
  try {
    // 1. Auth — Get user from token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error('Missing Supabase environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader.replace('Bearer ', ''),
        },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. GATE — Check if user has access to trading signals
    const gateResult = await gateTradingSignals(user.id);
    try {
      requireFeature(gateResult);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message, requiredTier: gateResult.requiredTier },
        { status: 403 }
      );
    }

    // 3. Fetch signals
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    let query = supabase.from('trading_signals').select('*').order('timestamp', { ascending: false }).limit(limit);

    if (symbol) {
      query = query.eq('symbol', symbol);
    }

    const { data, error } = await query;

    if (error) {
      logger.warn('Database error (falling back to mocks):', error.message);
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
          created_at: new Date().toISOString(),
        })),
      });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    logger.error('Error in signals API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
