import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';
import { verifyMFAToken } from '@/lib/mfa';

const JWT_SECRET = new TextEncoder().encode(
    process.env.SUPABASE_JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token: mfaToken, secret } = body;

        if (!mfaToken || !secret) {
            return NextResponse.json({ success: false, message: 'Missing token or secret' }, { status: 400 });
        }

        // 1. Verify Auth
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const jwtToken = authHeader.substring(7);
        let userId: string;

        try {
            const verified = await jwtVerify(jwtToken, JWT_SECRET);
            userId = verified.payload.sub as string;
        } catch (err) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        // 2. Verify MFA Token
        const isValid = verifyMFAToken(mfaToken, secret);
        if (!isValid) {
            return NextResponse.json({ success: false, message: 'Invalid MFA code' }, { status: 400 });
        }

        // 3. Enable MFA in DB
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        // But we set RLS to allow user to update own profile, so ANON key with user context is fine if we use supabase.auth.setSession?
        // Actually, we are in API route, we can use Service Role Key to bypass RLS for admin actions if needed, 
        // OR use the user's JWT to act as them.
        // Let's use Service Role for reliability in this critical step, ensuring we write to admin_users.

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const { error } = await supabaseAdmin
            .from('admin_users')
            .update({
                mfa_enabled: true,
                mfa_secret: secret
            })
            .eq('id', userId);

        if (error) {
            console.error('DB Error:', error);
            return NextResponse.json({ success: false, message: 'Failed to enable MFA' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'MFA enabled successfully'
        });

    } catch (error) {
        console.error('MFA Verify Error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
