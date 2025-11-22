import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.SUPABASE_JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function GET(request: NextRequest) {
    try {
        // 1. Extract Token
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);

        // 2. Verify Token
        let userId: string;
        try {
            const verified = await jwtVerify(token, JWT_SECRET);
            userId = verified.payload.sub as string;
        } catch (err) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        // 3. Initialize Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 4. Fetch User Tier
        const { data, error } = await supabase
            .from('users')
            .select('subscription_tier, created_at')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user tier:', error);
            // Default to free if user not found in public table
            return NextResponse.json({
                tier: 'free',
                slot_number: null,
                joined_at: null
            });
        }

        return NextResponse.json({
            tier: data.subscription_tier || 'free',
            slot_number: null, // Slot logic can be added later if needed
            joined_at: data.created_at
        });

    } catch (error) {
        console.error('User tier endpoint error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        );
    }
}
