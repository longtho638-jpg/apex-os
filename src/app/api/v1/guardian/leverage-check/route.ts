import { NextResponse } from 'next/server';

export async function GET() {
    // Mock data for Leverage Check
    return NextResponse.json({
        current_leverage: 8.5,
        recommended_leverage: 5.0,
        max_leverage: 20.0,
        risk_level: "medium"
    });
}
