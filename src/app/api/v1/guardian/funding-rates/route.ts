import { NextResponse } from 'next/server';

export async function GET() {
    // Mock data for Funding Rates
    return NextResponse.json({
        rates: [
            {
                symbol: "BTC/USDT",
                rate: 0.0001, // 0.01%
                next_funding: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
                estimated_payment: -15.50 // Paying funding
            },
            {
                symbol: "ETH/USDT",
                rate: -0.0002, // -0.02%
                next_funding: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
                estimated_payment: 12.25 // Receiving funding
            }
        ]
    });
}
