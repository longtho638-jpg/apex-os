import { NextResponse } from 'next/server';
import { withdrawalService } from '@/lib/finance/withdrawal-service';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { adminId, amount, destinationAddress } = await request.json();

    if (!adminId || !amount || !destinationAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await withdrawalService.requestWithdrawal(adminId, amount, destinationAddress);

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Withdrawal API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
