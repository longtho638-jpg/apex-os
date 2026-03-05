import { type NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/jwt';
import { logger } from '@/lib/logger';
import { WalletService } from '@/lib/services/wallet.service';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const payload = verifySessionToken(token);

    if (!payload) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const wallet = await WalletService.getWallet(payload.sub);

    return NextResponse.json({
      success: true,
      wallet,
    });
  } catch (error: any) {
    logger.error('Wallet API Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
