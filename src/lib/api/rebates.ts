/**
 * Rebates API client and TypeScript types
 */

import { get } from './client';

export interface RebateData {
  total_rebates: number;
  monthly_average: number;
  rebate_history: Array<{
    date: string;
    amount: number;
    trades_count: number;
    exchange: string;
  }>;
}

/**
 * Fetch rebate data for a user
 */
export async function fetchRebates(userId: string, token?: string): Promise<RebateData> {
  return get<RebateData>('/auditor/rebates', {
    params: { user_id: userId },
    token,
  });
}

/**
 * Calculate estimated rebate based on volume
 */
export function calculateEstimatedRebate(
  volume: number,
  rebateRate: number = 0.0002, // 0.02% default
): number {
  return volume * rebateRate;
}
