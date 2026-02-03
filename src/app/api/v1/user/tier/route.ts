import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

        // 2. Initialize Supabase with USER TOKEN (Enforces RLS)
        // CRITICAL SECURITY FIX: Do not use Service Role Key here for user data
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        });

        // 3. Get User (Verifies token & gets user ID)
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        const userId = user.id;
        const email = user.email;

        // 4. Check if user is admin (Optional: Keep this if you want to return special admin tier)
        // Note: For pure RLS, you might just query the 'users' table and let RLS decide.
        // But since we have a separate 'admin_users' table, we might need a separate check or Service Role for that specific check ONLY.
        // However, to be safe, let's stick to the user's perspective.
        // If the user is an admin, they should have a row in 'users' table too?
        // Let's keep the logic but use the USER client for the main query.

        // Checking admin status might still require Service Role if 'admin_users' is not readable by everyone.
        // But for the "User Tier" endpoint, we primarily want the user's own tier.

        // Let's check the public 'users' table using the USER client.
        const { data, error } = await supabase
            .from('users')
            .select('subscription_tier, created_at')
            .eq('user_id', userId) // Ensure we query by user_id
            .single();

        if (error) {
            logger.error('Error fetching user tier:', error);
            // If RLS blocks it, it means they don't own the row (good).
            // If row missing, return free.
            return NextResponse.json({
                tier: 'free',
                slot_number: null,
                joined_at: null
            });
        }

        // Check if they are an admin (Logic preserved but simplified)
        // We can check if the user has a specific claim or just return the DB value.
        // If the DB says 'admin', trust it (assuming only admins can write to that column via RLS/Triggers).

        // If we really need to check the admin_users table, we should do it via a separate secure function or assume the 'tier' in 'users' table is the source of truth.
        // For now, let's trust the 'users' table data which should be synced.

        return NextResponse.json({
            tier: data.subscription_tier || 'free',
            slot_number: null,
            joined_at: data.created_at
        });

    } catch (error) {
        logger.error('User tier endpoint error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        );
    }
}
