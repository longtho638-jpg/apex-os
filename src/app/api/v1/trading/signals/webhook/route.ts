import { CopyTradingEngine } from '@/lib/trading/CopyTradingEngine';
import { NextResponse } from 'next/server';

// This endpoint receives trade signals (e.g., from a Leader's bot or admin console)
// and triggers the Copy Trading Engine.
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { leaderId, symbol, type, entryPrice, leverage, secret } = body;

        // Simple security check (in prod use proper auth)
        if (secret !== 'apex-admin-secret') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        if (!leaderId || !symbol || !entryPrice) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Trigger the Engine
        const result = await CopyTradingEngine.processSignal({
            leaderId,
            symbol,
            type,
            entryPrice,
            leverage: leverage || 10
        });

        return NextResponse.json({
            success: true,
            message: 'Signal processed',
            details: result
        });

    } catch (error) {
        console.error('[Signal Webhook] Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
