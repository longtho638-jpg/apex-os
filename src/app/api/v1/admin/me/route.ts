import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
    try {
        // 1. Extract Token
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

        // 2. Verify Auth using Supabase Auth (more robust than manual JWT verification)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        const userId = user.id;

        // 3. Fetch Admin Profile
        // Use Service Role Key to bypass RLS since we verified the user
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const { data, error } = await supabaseAdmin
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

