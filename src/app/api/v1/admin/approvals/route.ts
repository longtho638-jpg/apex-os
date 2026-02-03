import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { multiSigService } from '@/lib/security/multi-sig';

export async function GET() {
    try {
        const requests = await multiSigService.getPendingRequests();
        return NextResponse.json({ success: true, data: requests });
    } catch (error) {
        logger.error('Get approvals error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
