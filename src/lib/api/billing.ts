/**
 * RaaS Billing API — zero subscription, volume-based tiers
 */

import { get } from './client';
import { TierId } from '@/config/unified-tiers';

export interface RaaSBillingInfo {
    current_tier: TierId;
    tier_name: string;
    monthly_volume: number;
    spread_rate: number;
    self_rebate_rate: number;
    agent_slots: number;
    volume_to_next_tier: number;
    features: string[];
    earning_history: Array<{
        date: string;
        amount: number;
        type: 'self_rebate' | 'referral_l1' | 'referral_l2' | 'referral_l3' | 'referral_l4';
        description: string;
    }>;
}

/**
 * Fetch RaaS billing and tier information
 */
export async function fetchBillingInfo(
    userId: string,
    token?: string
): Promise<RaaSBillingInfo> {
    return get<RaaSBillingInfo>('/billing/tier-info', {
        params: { user_id: userId },
        token,
    });
}
