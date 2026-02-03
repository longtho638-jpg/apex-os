import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySessionToken } from '@/lib/jwt';
import { z } from 'zod';

const updateSchema = z.object({
    name: z.string().min(1).optional(),
    status: z.enum(['active', 'paused', 'ended']).optional(),
    end_date: z.string().optional().nullable()
});

export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;

        // Auth check
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.substring(7);
        const payload = verifySessionToken(token);
        if (!payload) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data: user } = await supabase
            .from('users')
            .select('role')
            .eq('id', payload.sub)
            .single();

        if (!user || !['super_admin', 'admin'].includes(user.role)) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const validation = updateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: 'Validation failed',
                errors: validation.error.format()
            }, { status: 400 });
        }

        const { data: campaign, error } = await supabase
            .from('ab_test_campaigns')
            .update(validation.data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            campaign
        });

    } catch (error) {
        logger.error('Update campaign error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;

        // Auth check
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.substring(7);
        const payload = verifySessionToken(token);
        if (!payload) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data: user } = await supabase
            .from('users')
            .select('role')
            .eq('id', payload.sub)
            .single();

        if (!user || !['super_admin', 'admin'].includes(user.role)) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const { error } = await supabase
            .from('ab_test_campaigns')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Campaign deleted'
        });

    } catch (error) {
        logger.error('Delete campaign error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
