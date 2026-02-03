import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { processTradeCommission } from '@/lib/viral-economics/realtime-commission';

export async function POST(req: Request) {
  try {
    // Verify secret
    const signature = req.headers.get('x-webhook-secret');
    if (signature !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { user_id, volume, fee, exchange, symbol, trade_id } = body;

    if (!user_id || !volume) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Process commission
    // We await it here to ensure reliability for the MVP. 
    // In high-scale prod, push to a queue (Redis/BullMQ).
    await processTradeCommission({
      user_id,
      volume: Number(volume),
      fee: Number(fee || 0),
      exchange: exchange || 'unknown',
      symbol: symbol || 'UNKNOWN',
      trade_id
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('Trade Execution Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
