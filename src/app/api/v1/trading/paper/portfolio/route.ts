import { NextResponse } from 'next/server';
import { PaperTradingEngine } from '@/lib/trading/paper-trading';

const engine = new PaperTradingEngine();

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'UserId required' }, { status: 400 });
        }

        const wallet = await engine.getWallet(userId);
        
        return NextResponse.json(wallet || { message: 'No wallet found' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
