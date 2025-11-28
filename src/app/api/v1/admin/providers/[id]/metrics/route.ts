import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySessionToken } from '@/lib/jwt';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;

        // 1. Verify admin JWT
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({
                success: false,
                message: 'Missing authorization header'
            }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const payload = verifySessionToken(token);
        if (!payload) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        // 2. Check if user is admin
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', payload.sub)
            .single();

        if (userError || !user || !['super_admin', 'admin'].includes(user.role)) {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized'
            }, { status: 403 });
        }

        // 3. Parse query params
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // 4. Fetch metrics
        const { data: metrics, error } = await supabaseAdmin
            .from('provider_metrics')
            .select('*')
            .eq('provider_id', id)
            .gte('date', startDate.toISOString().split('T')[0])
            .order('date', { ascending: true });

        if (error) {
            console.error('Metrics fetch error:', error);
            return NextResponse.json({
                success: false,
                message: 'Failed to fetch metrics'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            metrics: metrics || []
        });

    } catch (error) {
        console.error('[ADMIN] Metrics error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}
