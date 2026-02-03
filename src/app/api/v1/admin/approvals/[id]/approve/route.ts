import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { multiSigService } from '@/lib/security/multi-sig';

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;
        const { adminId } = await request.json();

        if (!adminId) {
            return NextResponse.json(
                { error: 'Admin ID is required' },
                { status: 400 }
            );
        }

        const result = await multiSigService.approveRequest(id, adminId);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            isFullyApproved: result.isFullyApproved
        });

    } catch (error) {
        logger.error('Approve request error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
