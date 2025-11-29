/**
 * Singleton Supabase Clients
 * This ensures only one instance is created for each type to avoid multiple GoTrueClient instances warning
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseServerInstance: SupabaseClient | null = null;
let supabaseClientInstance: SupabaseClient | null = null;

/**
 * Get or create the singleton Supabase client instance for SERVER-SIDE operations
 * Uses service role key for admin/backend operations
 */
export function getSupabaseClient(): SupabaseClient {
    throw new Error('getSupabaseClient (Server/Admin) is NOT available in Mobile App. Use getSupabaseClientSide() instead.');
}

/**
 * Get or create the singleton Supabase client instance for CLIENT-SIDE operations
 * Uses anon key for frontend operations with user auth
 */
export function getSupabaseClientSide(): SupabaseClient {
    if (typeof window === 'undefined') {
        throw new Error('getSupabaseClientSide can only be called in browser context');
    }

    if (!supabaseClientInstance) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase client environment variables');
        }

        supabaseClientInstance = createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: true
            }
        });
    }

    return supabaseClientInstance;
}

// Legacy named export - still lazy because it's a function call
export const supabase = getSupabaseClient;



