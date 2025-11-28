import { NextResponse } from 'next/server';
import { multiSigService } from '@/lib/security/multi-sig';

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;
        const { adminId, reason } = await request.json();

        if (!adminId || !reason) {
            return NextResponse.json(
                { error: 'Admin ID and reason are required' },
                { status: 400 }
            );
        }

        const result = await multiSigService.rejectRequest(id, adminId, reason);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Reject request error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
