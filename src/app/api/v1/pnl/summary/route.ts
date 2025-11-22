import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    // Mock PnL summary data
    return NextResponse.json({
        total_pnl: 2315.00,
        pnl_percent: 5.78,
        total_trades: 127,
        win_rate: 65.4,
        best_day: 1250.00,
        worst_day: -340.00,
        daily_pnl: [
            { date: '2025-11-16', pnl: 120.50 },
            { date: '2025-11-17', pnl: -85.30 },
            { date: '2025-11-18', pnl: 340.00 },
            { date: '2025-11-19', pnl: 215.80 },
            { date: '2025-11-20', pnl: -120.00 },
            { date: '2025-11-21', pnl: 580.50 },
            { date: '2025-11-22', pnl: 1263.50 },
        ],
    });
}
