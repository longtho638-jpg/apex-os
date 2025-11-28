/**
 * Referral API client and TypeScript types
 */

import { get } from './client';

export interface ReferralStats {
    referral_link: string;
    referral_code: string;
    total_referrals: number;
    total_commission: number;
    this_month_commission: number;
    referrals: Array<{
        referee_id: string;
        signup_date: string;
        volume: number;
        commission: number;
        status: 'active' | 'inactive';
    }>;
}

/**
 * Fetch referral statistics for a user
 */
export async function fetchReferralStats(
    userId: string,
    token?: string
): Promise<ReferralStats> {
    return get<ReferralStats>('/referral/stats', {
        params: { user_id: userId },
        token,
    });
}
