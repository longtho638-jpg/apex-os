import { TradingService } from '@backend/services/trading';
import { type NextRequest, NextResponse } from 'next/server';

// GET - List positions
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const tradingService = new TradingService();
    const positions = await tradingService.getPositions(userId);

    return NextResponse.json({ success: true, positions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Close position
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { positionId, userId } = body;

    if (!positionId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const tradingService = new TradingService();
    const result = await tradingService.closePosition(userId, positionId);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
