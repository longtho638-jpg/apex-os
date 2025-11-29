/**
 * Billing/Payment API client and TypeScript types
 */

import { get } from './client';
import { TierId } from '@/config/unified-tiers';

export interface SubscriptionInfo {
    current_tier: TierId;
    plan_name: string;
    price: number;
    billing_cycle: 'monthly' | 'yearly';
    next_billing_date: string;
    features: string[];
    usage: {
        api_calls: number;
        api_limit: number;
        storage_gb: number;
        storage_limit: number;
    };
    payment_history: Array<{
        date: string;
        amount: number;
        status: 'completed' | 'pending' | 'failed';
        description: string;
    }>;
}

/**
 * Fetch subscription and billing information
 */
export async function fetchSubscriptionInfo(
    userId: string,
    token?: string
): Promise<SubscriptionInfo> {
    return get<SubscriptionInfo>('/billing/subscription', {
        params: { user_id: userId },
        token,
    });
}
