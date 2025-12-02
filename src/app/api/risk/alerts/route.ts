import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    // Mock Alerts Data
    // In production, this would query a 'risk_alerts' table populated by a background worker.
    
    const alerts = [
        {
            id: 'alert-1',
            type: 'CRITICAL',
            title: 'Whale Movement Detected',
            message: 'Wallet 0x7...a9f moved 5,000 BTC to Binance.',
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
            icon: 'whale'
        },
        {
            id: 'alert-2',
            type: 'WARNING',
            title: 'High Volatility Alert',
            message: 'ETH/USDT volatility exceeded 5% in the last hour.',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
            icon: 'volatility'
        },
        {
            id: 'alert-3',
            type: 'INFO',
            title: 'Liquidation Heatmap',
            message: 'Large cluster of short liquidations at $68,500.',
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
            icon: 'liquidity'
        },
        {
            id: 'alert-4',
            type: 'WARNING',
            title: 'Arbitrage Gap Closing',
            message: 'Binance vs OKX spread narrowing. Adjust bot parameters.',
            timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
            icon: 'arbitrage'
        }
    ];

    return NextResponse.json({ success: true, data: alerts });
}
