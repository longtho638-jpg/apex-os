/**
 * Risk Management API client and TypeScript types
 */

import { get } from './client';
import { riskLogger } from '@/lib/logger';

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
 * Fetch liquidation risk metrics with error handling
 */
export async function fetchLiquidationRisk(
    userId: string,
    token?: string
): Promise<LiquidationRisk | null> {
    try {
        riskLogger.info('Fetching liquidation risk', { userId });

        const result = await get<LiquidationRisk>('/guardian/liquidation-risk', {
            params: { user_id: userId },
            token,
        });

        riskLogger.info('Liquidation risk fetched successfully', { userId });
        return result;
    } catch (error) {
        riskLogger.error('Liquidation risk fetch failed', {
            userId,
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        // Return safe default instead of crashing
        return null;
    }
}

/**
 * Fetch leverage analysis with error handling
 */
export async function fetchLeverageCheck(
    userId: string,
    token?: string
): Promise<LeverageCheck | null> {
    try {
        riskLogger.info('Fetching leverage check', { userId });

        const result = await get<LeverageCheck>('/guardian/leverage-check', {
            params: { user_id: userId },
            token,
        });

        riskLogger.info('Leverage check fetched successfully', { userId });
        return result;
    } catch (error) {
        riskLogger.error('Leverage check fetch failed', {
            userId,
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        return null;
    }
}

/**
 * Fetch funding rates with error handling
 */
export async function fetchFundingRates(
    userId: string,
    token?: string
): Promise<FundingRates | null> {
    try {
        riskLogger.info('Fetching funding rates', { userId });

        const result = await get<FundingRates>('/guardian/funding-rates', {
            params: { user_id: userId },
            token,
        });

        riskLogger.info('Funding rates fetched successfully', { userId });
        return result;
    } catch (error) {
        riskLogger.error('Funding rates fetch failed', {
            userId,
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        return null;
    }
}
