import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { applyRateLimit } from '@/middleware/rateLimit';
import { gateAdvancedAnalytics, requireFeature } from '@/lib/raas-gate';

export async function GET(request: NextRequest) {
  try {
    // 1. Rate Limit
    const rateResponse = await applyRateLimit(request);
    if (rateResponse) return rateResponse;

    // 2. Auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    // 3. GATE — Check if user has access to advanced analytics
    const gateResult = await gateAdvancedAnalytics(user.id);
    try {
      requireFeature(gateResult);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message, requiredTier: gateResult.requiredTier },
        { status: 403 }
      );
    }

    // 4. Params
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '30d';

    let days = 30;
    if (range === '7d') days = 7;
    if (range === '90d') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 5. Fetch Summary Metrics (RPC)
    const { data: summary, error: summaryError } = await supabase.rpc('get_user_pnl', {
      p_user_id: user.id,
      p_start_date: startDate.toISOString(),
    });

    if (summaryError) throw summaryError;

    // 6. Fetch Chart Data (Aggregation)
    const { data: chartData, error: chartError } = await supabase
      .from('trades')
      .select('created_at, price, quantity, side, fee')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (chartError) throw chartError;

    // Process chart data in JS
    const dailyMap = new Map<string, number>();

    chartData?.forEach((trade) => {
      const day = trade.created_at.split('T')[0];
      const vol = trade.price * trade.quantity;
      dailyMap.set(day, (dailyMap.get(day) || 0) + vol);
    });

    const chart = Array.from(dailyMap.entries()).map(([date, value]) => ({
      date,
      value,
    }));

    return NextResponse.json({
      success: true,
      data: {
        summary: summary[0] || { total_realized_pnl: 0, trade_count: 0, volume: 0 },
        chart,
      },
    });
  } catch (error: any) {
    logger.error('Analytics error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch analytics' }, { status: 500 });
  }
}
