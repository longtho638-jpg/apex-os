import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.SUPABASE_JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function GET(request: NextRequest) {
    try {
        // 1. Verify Auth
        const authHeader = request.headers.get('authorization');
        let token: string | undefined;

        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else {
            token = request.cookies.get('apex_session')?.value;
        }

        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        let userId: string;

        try {
            const verified = await jwtVerify(token, JWT_SECRET);
            userId = verified.payload.sub as string;
        } catch (err) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        // 2. Fetch Admin Profile
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        // Use Service Role Key to bypass RLS since we verified the JWT manually
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching admin profile:', error);
            return NextResponse.json({ success: false, message: 'Admin profile not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            admin: {
                id: data.id,
                email: data.email,
                role: data.role,
                mfa_enabled: data.mfa_enabled,
                last_login: data.last_login
            }
        });

    } catch (error) {
        console.error('Admin Me API Error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
