import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySessionToken } from '@/lib/jwt';
import { z } from 'zod';

// Schema for template validation
const templateSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    html_content: z.string().min(1, 'HTML content is required'),
    preview_image_url: z.string().optional(),
    is_active: z.boolean().optional()
});

export async function GET(request: NextRequest) {
    try {
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

        const { data: templates, error } = await supabase
            .from('referral_templates')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({
            success: true,
            templates: templates || []
        });

    } catch (error) {
        logger.error('Fetch templates error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // Auth check (Admin only)
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.substring(7);
        const payload = verifySessionToken(token);
        if (!payload) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        // Verify admin role
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
        const validation = templateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: 'Validation failed',
                errors: validation.error.format()
            }, { status: 400 });
        }

        const { data: template, error } = await supabase
            .from('referral_templates')
            .insert([validation.data])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            template
        });

    } catch (error) {
        logger.error('Create template error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
