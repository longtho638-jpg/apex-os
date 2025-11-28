/**
 * MFA Check Helper
 * Determines if user requires MFA for admin login
 */

import { getSupabaseClient } from '../supabase';

const supabase = getSupabaseClient();


/**
 * Check if user has MFA enabled
 * @param userId - User ID from auth
 * @returns true if MFA is enabled, false otherwise
 * 
 * Fail-safe: Returns false on errors to not block login
 */
export async function checkMFARequired(userId: string): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('admin_users')
            .select('mfa_enabled')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('MFA check error:', error);
            return false; // Fail-safe: don't block login on DB errors
        }

        return data?.mfa_enabled || false;
    } catch (error) {
        console.error('MFA check exception:', error);
        return false; // Fail-safe
    }
}
