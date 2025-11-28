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
        let email: string | undefined;
        try {
            const verified = await jwtVerify(token, JWT_SECRET);
            userId = verified.payload.sub as string;
            email = verified.payload.email as string;
        } catch (err) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        // 3. Initialize Supabase with Service Role (to bypass RLS for admin check)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 4. Check if user is admin FIRST (by ID)
        let { data: adminUser } = await supabase
            .from('admin_users')
            .select('id, role')
            .eq('id', userId)
            .single();

        // Fallback: Check by email if ID check failed
        if (!adminUser && email) {
            console.log('Tier Check - ID failed, checking by email:', email);
            const { data: adminByEmail } = await supabase
                .from('admin_users')
                .select('id, role')
                .eq('email', email)
                .single();

            if (adminByEmail) {
                adminUser = adminByEmail;
                console.log('Tier Check - Found by email:', adminUser);
            }
        }

        console.log('Tier Check - UserId:', userId);
        console.log('Tier Check - AdminUser:', adminUser);

        if (adminUser) {
            // User is admin - return admin tier
            return NextResponse.json({
                tier: 'admin',
                role: adminUser.role || 'admin',
                slot_number: null,
                joined_at: null
            });
        }

        // 5. Check regular user tier (for non-admin users)
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
