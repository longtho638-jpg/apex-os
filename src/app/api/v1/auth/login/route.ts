import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SignJWT } from 'jose';

// JWT Configuration - must match middleware
const JWT_SECRET = new TextEncoder().encode(
    process.env.SUPABASE_JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
    try {
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

        // Create JWT token for middleware authentication
        const token = await new SignJWT({
            sub: data.user.id,
            email: data.user.email,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .setIssuedAt()
            .sign(JWT_SECRET);

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
            // Gracefully handle missing user details
            console.error('Error fetching user details:', detailError);
        }

        return NextResponse.json({
            success: true,
            message: 'Login successful',
            token,
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
