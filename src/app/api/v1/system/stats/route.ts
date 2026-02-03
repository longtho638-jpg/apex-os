import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { SystemStatsService } from '@/lib/system-stats';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const statsService = new SystemStatsService();

    const [globalStats, recentActivity, tradingStats, financeStats, signalStats] = await Promise.all([
      statsService.getGlobalStats(),
      statsService.getRecentActivity(),
      statsService.getTradingStats(),
      statsService.getFinanceStats(),
      statsService.getSignalStats()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...globalStats,
        recentActivity,
        trading: tradingStats,
        finance: financeStats,
        signals: signalStats
      }
    });

  } catch (error: any) {
    logger.error('[System Stats API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
