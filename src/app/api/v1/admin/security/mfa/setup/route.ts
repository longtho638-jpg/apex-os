import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';
import { generateMFASecret } from '@/lib/mfa';

const JWT_SECRET = new TextEncoder().encode(
    process.env.SUPABASE_JWT_SECRET || 'your-secret-key-change-in-production'
);

// Use Service Role Key for DB operations to bypass RLS
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
    try {
        // 1. Verify Auth
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        let userId: string;
        let email: string;

        try {
            const verified = await jwtVerify(token, JWT_SECRET);
            userId = verified.payload.sub as string;
            email = verified.payload.email as string;
        } catch (err) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        // 2. Generate Secret
        const { secret, uri, qrCode } = await generateMFASecret(email);

        // 3. Store secret temporarily (or return to client to confirm)
        // For security, we usually don't store it until confirmed. 
        // But we need to verify it in the next step.
        // Strategy: Return secret to client, client sends it back with token to verify.
        // OR: Store in DB with 'pending' status.
        // Simpler approach for now: Return to client, client must send secret + token to 'enable' endpoint.

        return NextResponse.json({
            success: true,
            secret,
            qrCode
        });

    } catch (error) {
        console.error('MFA Setup Error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
