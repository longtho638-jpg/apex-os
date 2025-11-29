/**
 * Risk Management API client and TypeScript types
 */

import { get } from './client';

export interface LiquidationRisk {
    risk_score: number; // 0-100
    liquidation_price: number;
    distance_percent: number;
    positions: Array<{
        symbol: string;
        size: number;
        leverage: number;
        liquidation_price: number;
    }>;
}

export interface LeverageCheck {
    current_leverage: number;
    recommended_leverage: number;
    max_leverage: number;
    risk_level: 'low' | 'medium' | 'high';
}

export interface FundingRates {
    rates: Array<{
        symbol: string;
        rate: number;
        next_funding: string;
        estimated_payment: number;
    }>;
}

/**
 * Fetch liquidation risk metrics
 */
export async function fetchLiquidationRisk(
    userId: string,
    token?: string
): Promise<LiquidationRisk> {
    return get<LiquidationRisk>('/guardian/liquidation-risk', {
        params: { user_id: userId },
        token,
    });
}

/**
 * Fetch leverage analysis
 */
export async function fetchLeverageCheck(
    userId: string,
    token?: string
): Promise<LeverageCheck> {
    return get<LeverageCheck>('/guardian/leverage-check', {
        params: { user_id: userId },
        token,
    });
}

/**
 * Fetch funding rates
 */
export async function fetchFundingRates(
    userId: string,
    token?: string
): Promise<FundingRates> {
    return get<FundingRates>('/guardian/funding-rates', {
        params: { user_id: userId },
        token,
    });
}
