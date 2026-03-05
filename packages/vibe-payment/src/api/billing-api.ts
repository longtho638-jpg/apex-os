/**
 * Billing API factory — accepts a generic fetcher to decouple from app HTTP client.
 */

import type { BillingFetcher, RaaSBillingInfo } from '../types/billing-types';

export function createBillingApi(fetcher: BillingFetcher) {
  return {
    fetchBillingInfo(userId: string, token?: string): Promise<RaaSBillingInfo> {
      return fetcher<RaaSBillingInfo>('/billing/tier-info', {
        params: { user_id: userId },
        token,
      });
    },
  };
}
