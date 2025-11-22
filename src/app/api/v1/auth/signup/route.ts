import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SignJWT } from 'jose';

// JWT Configuration - must match middleware and login endpoint
const JWT_SECRET = new TextEncoder().encode(
    process.env.SUPABASE_JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, full_name } = body;

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
                return NextResponse.json(
                    { success: false, message: 'Email already exists' },
                    { status: 409 }
                );
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

        // Create user entry in public.users table
        try {
            const { error: dbError } = await supabase.from('users').insert({
                id: authData.user.id,
                email: authData.user.email,
                full_name: full_name || authData.user.email?.split('@')[0] || 'User',
                subscription_tier: 'free', // Default tier
                created_at: new Date().toISOString(),
            });

            // If user already exists in table, that's okay (might have been created by trigger)
            if (dbError && !dbError.message.includes('duplicate')) {
                console.error('Error creating user in database:', dbError);
            }
        } catch (dbError) {
            console.error('Database error:', dbError);
            // Continue anyway - user is created in Auth
        }

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
        const token = await new SignJWT({
            sub: authData.user.id,
            email: authData.user.email,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .setIssuedAt()
            .sign(JWT_SECRET);

        return NextResponse.json({
            success: true,
            message: 'Account created successfully',
            token,
            user: {
                id: authData.user.id,
                email: authData.user.email,
                full_name: full_name || authData.user.email?.split('@')[0] || 'User',
            },
        });
    } catch (error) {
        console.error('Signup endpoint error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        );
    }
}
