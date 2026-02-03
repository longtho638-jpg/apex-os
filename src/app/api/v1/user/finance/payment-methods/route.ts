import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/jwt';
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

        const methods = await WalletService.getPaymentMethods(payload.sub);

        return NextResponse.json({
            success: true,
            methods
        });

    } catch (error: any) {
        logger.error('Payment Methods API Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

import { PaymentMethodSchema } from '@/lib/validations/finance';

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

        const body = await request.json();

        // Zod Validation
        const validation = PaymentMethodSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: 'Invalid request',
                errors: validation.error.issues
            }, { status: 400 });
        }

        const method = await WalletService.addPaymentMethod(payload.sub, validation.data);

        return NextResponse.json({
            success: true,
            method
        });

    } catch (error: any) {
        logger.error('Add Payment Method API Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
