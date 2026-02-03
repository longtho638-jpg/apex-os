import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseClient();

  try {
    // 1. Get All Open Positions
    const { data: positions } = await supabase
      .from('virtual_positions')
      .select('symbol, side, user_id')
      .eq('status', 'OPEN');

    if (!positions || positions.length === 0) {
        return NextResponse.json({ message: 'No active positions to analyze' });
    }

    // 2. Group by Symbol and Calculate Ratios
    const sentiment: Record<string, { longs: number, shorts: number, participants: number }> = {};

    positions.forEach(pos => {
        if (!sentiment[pos.symbol]) sentiment[pos.symbol] = { longs: 0, shorts: 0, participants: 0 };
        sentiment[pos.symbol].participants++;
        if (pos.side === 'LONG') sentiment[pos.symbol].longs++;
        else sentiment[pos.symbol].shorts++;
    });

    // 3. Store Hive Signals
    const inserts = Object.entries(sentiment).map(([symbol, stats]) => {
        const total = stats.longs + stats.shorts;
        const longRatio = total > 0 ? stats.longs / total : 0;
        const shortRatio = total > 0 ? stats.shorts / total : 0;
        
        // Confidence Score (Mock Logic: Higher volume = higher confidence)
        const confidence = Math.min(0.99, stats.participants / 100); // Cap at 0.99

        return {
            symbol,
            long_ratio: longRatio,
            short_ratio: shortRatio,
            active_participants: stats.participants,
            confidence_score: confidence
        };
    });

    if (inserts.length > 0) {
        await supabase.from('hive_signals').insert(inserts);
    }

    return NextResponse.json({ success: true, signals_generated: inserts.length });

  } catch (error: any) {
    logger.error('Hive Mind Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
