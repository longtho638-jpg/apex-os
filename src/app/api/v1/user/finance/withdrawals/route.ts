import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/jwt';
import { WalletService } from '@/lib/services/wallet.service';
import { WithdrawalRequestSchema } from '@/lib/validations/finance';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
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

        // Rate Limiting: 5 requests per minute per user
        const { success, reset } = await rateLimit(`withdrawal:${payload.sub}`, { limit: 5, window: 60 });
        if (!success) {
            return rateLimitResponse(reset);
        }

        const body = await request.json();

        // Zod Validation
        const validation = WithdrawalRequestSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: 'Invalid request',
                errors: validation.error.issues
            }, { status: 400 });
        }

        const { amount, payment_method_id } = validation.data;

        const withdrawal = await WalletService.requestWithdrawal(payload.sub, amount, payment_method_id);

        return NextResponse.json({
            success: true,
            withdrawal
        });

    } catch (error: any) {
        logger.error('Withdrawal API Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
