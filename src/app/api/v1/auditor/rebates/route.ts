import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    // Mock auditor rebates data
    return NextResponse.json({
        total_rebates: 1847.25,
        pending_rebates: 124.50,
        rebates_history: [
            {
                date: '2025-11-22',
                exchange: 'Binance',
                amount: 45.80,
                status: 'completed',
            },
            {
                date: '2025-11-21',
                exchange: 'Bybit',
                amount: 32.50,
                status: 'completed',
            },
            {
                date: '2025-11-20',
                exchange: 'OKX',
                amount: 78.90,
                status: 'completed',
            },
            {
                date: '2025-11-19',
                exchange: 'Binance',
                amount: 124.50,
                status: 'pending',
            },
        ],
    });
}
