import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { generateSessionToken } from '@/lib/jwt';
import { getSupabaseClient } from '@/lib/supabase'; // Admin client
import { auditService } from '@/lib/audit';

// JWT Configuration - must match middleware and login endpoint
const JWT_SECRET = new TextEncoder().encode(
    process.env.SUPABASE_JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, full_name } = body;

        // 0. Anti-Fraud: Check IP Reputation
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // 0.1 Anti-Fraud: Disposable Email
        const { isDisposableEmail } = await import('@/lib/security/disposable-email');
        if (isDisposableEmail(email)) {
            return NextResponse.json(
                { success: false, message: 'Disposable email addresses are not allowed. Please use a valid email provider.' },
                { status: 400 }
            );
        }

        if (ip !== 'unknown' && ip !== '127.0.0.1' && ip !== '::1') {
            const supabaseAdmin = getSupabaseClient();
            const yesterday = new Date();
            yesterday.setHours(yesterday.getHours() - 24);

            const { count, error: countError } = await supabaseAdmin
                .from('audit_logs')
                .select('id', { count: 'exact', head: true })
                .eq('action', 'SIGNUP')
                .eq('ip_address', ip)
                .gte('created_at', yesterday.toISOString());

            if (!countError && count !== null && count >= 3) {
                logger.warn(`[Anti-Fraud] Blocked signup from IP ${ip} (Count: ${count})`);
                return NextResponse.json(
                    { success: false, message: 'Too many accounts created from this IP. Please try again later.' },
                    { status: 429 }
                );
            }
        }

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password required' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { success: false, message: 'Password must be at least 8 characters' },
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

        // SECURE: Create user with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: full_name || email.split('@')[0],
                },
            },
        });

        if (authError) {
            // Handle specific error cases
            if (authError.message.includes('already registered')) {
                // CRITICAL SECURITY FIX: Prevent User Enumeration
                // Return success even if email exists.
                return NextResponse.json({
                    success: true,
                    message: 'Account created. Please check your email to confirm.',
                    require_confirmation: true,
                    // Do not return user object if it was a duplicate to avoid leaking data
                });
            }

            return NextResponse.json(
                { success: false, message: authError.message },
                { status: 400 }
            );
        }

        if (!authData.user) {
            return NextResponse.json(
                { success: false, message: 'Signup failed' },
                { status: 500 }
            );
        }

        // 3. User Creation in public.users
        // Handled by Database Trigger (supabase/migrations/20251129_user_creation_trigger.sql)
        // We no longer manually insert here to avoid Dual Write issues.

        // 4. Log Signup Event (Anti-Fraud)
        await auditService.log({
            userId: authData.user.id,
            action: 'SIGNUP',
            resourceType: 'USER',
            resourceId: authData.user.id,
            ipAddress: ip,
            userAgent: request.headers.get('user-agent') || undefined
        });

        // If email confirmation is enabled, session will be null
        if (!authData.session) {
            return NextResponse.json({
                success: true,
                message: 'Account created. Please check your email to confirm.',
                require_confirmation: true,
                user: {
                    id: authData.user.id,
                    email: authData.user.email,
                    full_name: full_name || authData.user.email?.split('@')[0] || 'User',
                },
            });
        }

        // Generate JWT token for immediate login (only if session exists)
        // CRITICAL SECURITY FIX: Changed default role from 'admin' to 'user'
        const token = generateSessionToken(authData.user.email!, 'user', authData.user.id);

        const cookieStore = await cookies();
        cookieStore.set('apex_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7
        });

        return NextResponse.json({
            success: true,
            message: 'Account created successfully',
            // Token removed for security (HttpOnly cookie used)
            user: {
                id: authData.user.id,
                email: authData.user.email,
                full_name: full_name || authData.user.email?.split('@')[0] || 'User',
            },
        });
    } catch (error) {
        logger.error('Signup endpoint error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        );
    }
}
