/**
 * Singleton Supabase Clients
 * This ensures only one instance is created for each type to avoid multiple GoTrueClient instances warning
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let supabaseServerInstance: SupabaseClient | null = null;

/**
 * Get or create the singleton Supabase client instance for SERVER-SIDE operations
 * Uses service role key for admin/backend operations
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseServerInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase server environment variables');
    }

    supabaseServerInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseServerInstance;
}

/**
 * Get or create the singleton Supabase client instance for CLIENT-SIDE operations
 * Uses anon key for frontend operations with user auth
 */
export function getSupabaseClientSide(): SupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error('getSupabaseClientSide can only be called in browser context');
  }

  // Delegate to the singleton implementation in client.ts which uses auth-helpers
  const { createClient } = require('@/lib/supabase/client');
  return createClient();
}

// Legacy named export - still lazy because it's a function call
export const supabase = getSupabaseClient;
