import { NextResponse } from 'next/server';

export async function GET() {
    // Mock data for Subscription Info
    return NextResponse.json({
        current_tier: "premium",
        plan_name: "Pro Trader",
        price: 29.00,
        billing_cycle: "monthly",
        next_billing_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
        features: [
            "Unlimited Trading Pairs",
            "Advanced AI Indicators",
            "Real-time Risk Guardian",
            "Priority Support",
            "API Access"
        ],
        usage: {
            api_calls: 15420,
            api_limit: 100000,
            storage_gb: 2.5,
            storage_limit: 10.0
        },
        payment_history: [
            {
                date: "2024-03-01T10:00:00Z",
                amount: 29.00,
                status: "completed",
                description: "Pro Trader - Monthly"
            },
            {
                date: "2024-02-01T10:00:00Z",
                amount: 29.00,
                status: "completed",
                description: "Pro Trader - Monthly"
            }
        ]
    });
}
