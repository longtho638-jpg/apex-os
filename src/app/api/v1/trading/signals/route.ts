import { NextResponse } from 'next/server';
import { SignalGenerator } from '../../../../../../backend/ml/signal-generator';

const generator = new SignalGenerator();

// GET: Generate or fetch signals
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const symbols = searchParams.get('symbols')?.split(',') || ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'];

    if (action === 'generate') {
      const signals = await generator.generateAllSignals(symbols);
      return NextResponse.json({ success: true, signals });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
