import { NextResponse } from 'next/server';

export async function GET() {
    // Mock data for Liquidation Risk
    return NextResponse.json({
        risk_score: 65, // Medium risk
        liquidation_price: 42500.00,
        distance_percent: 15.5,
        positions: [
            {
                symbol: "BTC/USDT",
                size: 0.5,
                leverage: 10,
                liquidation_price: 42500.00
            },
            {
                symbol: "ETH/USDT",
                size: 5.0,
                leverage: 5,
                liquidation_price: 2800.00
            }
        ]
    });
}
