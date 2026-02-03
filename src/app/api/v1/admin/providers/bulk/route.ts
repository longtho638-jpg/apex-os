import { logger } from '@/lib/logger';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySessionToken } from '@/lib/jwt';

export async function PATCH(request: NextRequest) {
    try {
        // 1. Verify Auth
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const payload = verifySessionToken(token);
        if (!payload) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        // 2. Check Super Admin Role
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: user } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', payload.sub)
            .single();

        if (user?.role !== 'super_admin') {
            return NextResponse.json({ success: false, message: 'Super admin access required' }, { status: 403 });
        }

        // 3. Parse Body
        const body = await request.json();
        const { ids, action } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ success: false, message: 'No IDs provided' }, { status: 400 });
        }

        // 4. Perform Action
        let updateData = {};
        if (action === 'activate') {
            updateData = { status: 'active', is_active: true };
        } else if (action === 'deactivate') {
            updateData = { status: 'inactive', is_active: false };
        } else if (action === 'delete') {
            updateData = { status: 'deprecated', is_active: false };
        } else {
            return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('providers')
            .update({
                ...updateData,
                updated_by: payload.sub,
                updated_at: new Date().toISOString()
            })
            .in('id', ids);

        if (error) {
            logger.error('Bulk update error:', error);
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `Successfully updated ${ids.length} providers`
        });

    } catch (error: any) {
        logger.error('Bulk API Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
