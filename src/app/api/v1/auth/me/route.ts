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
            return NextResponse.json({ success: true, user: null });
        }

        // 2. Verify Auth
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

        const { data: { user }, error } = await supabaseAuth.auth.getUser(token);

        if (error || !user) {
            // Token invalid or expired - return null user, not 401 to avoid console errors
            return NextResponse.json({ success: true, user: null });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                // Add other necessary fields
            }
        });

    } catch (error) {
        console.error('Auth Me API Error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
