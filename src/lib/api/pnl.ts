/**
 * PnL API client and TypeScript types
 */

import { get } from './client';

export interface PnLSummary {
    total_pnl: number;
    win_rate: number;
    total_trades: number;
    best_pair: string;
    worst_pair: string;
    daily_pnl: Array<{
        date: string;
        pnl: number;
    }>;
    trade_breakdown: Array<{
        symbol: string;
        pnl: number;
        trades: number;
        win_rate: number;
    }>;
}

export type PnLPeriod = '7d' | '30d' | '90d' | '1y';

/**
 * Fetch PnL summary for a user
 */
export async function fetchPnLSummary(
    userId: string,
    period: PnLPeriod = '30d',
    token?: string
): Promise<PnLSummary> {
    return get<PnLSummary>('/pnl/summary', {
        params: { user_id: userId, days: periodToDays(period) },
        token,
    });
}

/**
 * Convert period string to number of days
 */
function periodToDays(period: PnLPeriod): number {
    switch (period) {
        case '7d': return 7;
        case '30d': return 30;
        case '90d': return 90;
        case '1y': return 365;
    }
}
