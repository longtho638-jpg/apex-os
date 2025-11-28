
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { SignJWT } from 'jose';
import { generateTempToken } from '@/lib/jwt';
import { checkRateLimit, LIMITS } from '@/lib/rateLimit';
import { auditService } from '@/lib/audit';

// JWT Configuration - must match middleware
const JWT_SECRET = new TextEncoder().encode(
    process.env.SUPABASE_JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
    try {
        // 1. Security: Rate Limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const limitResult = checkRateLimit(`login:${ip}`, LIMITS.AUTH_SENSITIVE);

        if (!limitResult.success) {
            return NextResponse.json(
                { success: false, message: 'Too many login attempts. Please try again later.' },
                { 
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': limitResult.limit.toString(),
                        'X-RateLimit-Remaining': limitResult.remaining.toString(),
                        'X-RateLimit-Reset': limitResult.reset.toString()
                    }
                }
            );
        }

        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password required' },
                { status: 400 }
            );
        }

        // Initialize Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json(
                { success: false, message: 'Server configuration error' },
                { status: 500 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // SECURE: Verify credentials with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !data.user || !data.session) {
            return NextResponse.json(
                { success: false, message: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Fetch user details from users table
        let userDetails: any = {};
        try {
            const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (userData) {
                userDetails = userData;
            }
        } catch (detailError) {
            console.error('Error fetching user details:', detailError);
        }

        // Check for Admin MFA Requirement
        // We use a separate admin client with Service Role to bypass RLS for this check
        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: adminUser, error: adminError } = await adminSupabase
            .from('admin_users')
            .select('mfa_enabled')
            .eq('id', data.user.id)
            .single();

        const mfaRequired = adminUser?.mfa_enabled || false;

        // If MFA is required, generate a temporary token for the MFA verification step
        // Otherwise, generate a full session token
        let token: string;

        if (mfaRequired) {
            // Generate temporary token with 5-minute expiry for MFA verification
            const { generateTempToken } = await import('@/lib/jwt');
            token = generateTempToken(data.user.email!);
        } else {
            // Create full JWT token using shared utility
            // This ensures compatibility with verifySessionToken (includes type: 'session')
            const { generateSessionToken } = await import('@/lib/jwt');
            // Default to 'admin' if role is missing or not compatible, to ensure token generation works.
            // The API endpoints will verify the actual role against the DB anyway.
            const role = (userDetails.role === 'super_admin' || userDetails.role === 'admin')
                ? userDetails.role
                : 'admin';

            token = generateSessionToken(data.user.email!, role, data.user.id);
        }

        // Set HttpOnly Cookie
        const cookieStore = await cookies();
        cookieStore.set('apex_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: mfaRequired ? 5 * 60 : 60 * 60 * 24 * 7 // 5 min for MFA temp, 7 days for session
        });

        // Log audit action
        await auditService.log({
            userId: data.user.id,
            action: 'LOGIN_SUCCESS',
            resourceType: 'AUTH',
            resourceId: data.user.id,
            ipAddress: ip,
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        return NextResponse.json({
            success: true,
            message: 'Login successful',
            // Token removed for security (HttpOnly cookie used)
            mfaRequired,
            user: {
                id: data.user.id,
                email: data.user.email,
                full_name: userDetails.full_name || 'User',
            },
        });
    } catch (error) {
        console.error('Login endpoint error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        );
    }
}
