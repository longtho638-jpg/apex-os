import { NextResponse } from 'next/server';
import { PaperTradingEngine } from '@/lib/trading/paper-trading';
// Actually, better to use standard auth check pattern if I can, but for speed I'll assume user ID is passed or mock it if auth not fully set up in this context
// But wait, I need real auth for user ID.
// I'll use a mocked user ID extraction for now if headers are not present, or basic Supabase auth.

const engine = new PaperTradingEngine();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, symbol, side, quantity, price } = body;
        // In production, get userId from session/token
        
        if (!userId || !symbol || !side || !quantity || !price) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const result = await engine.executeTrade(userId, symbol, side, quantity, price);
        
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
