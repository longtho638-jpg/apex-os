/**
 * React Hook for Portfolio Risk Analytics
 * 
 * Provides real-time VaR, Sharpe, and drawdown calculations.
 */

import { useState, useEffect, useMemo } from 'react';
import { riskCalculator } from '@/lib/risk/RiskMetrics';
import type { RiskMetrics, ReturnsSeries } from '@/lib/risk/types';

interface UsePortfolioRiskOptions {
    returns: number[];
    portfolioValue: number;
    refreshIntervalMs?: number;
    enabled?: boolean;
}

interface PortfolioRiskState {
    metrics: RiskMetrics | null;
    loading: boolean;
    error: Error | null;
    lastUpdate: number;
}

export function usePortfolioRisk({
    returns,
    portfolioValue,
    refreshIntervalMs = 60000,
    enabled = true
}: UsePortfolioRiskOptions): PortfolioRiskState {
    const [state, setState] = useState<PortfolioRiskState>({
        metrics: null,
        loading: true,
        error: null,
        lastUpdate: 0
    });

    const cumulativeReturns = useMemo(() => {
        const cumulative: number[] = [0];
        let sum = 0;

        for (const r of returns) {
            sum += r;
            cumulative.push(sum);
        }

        return cumulative;
    }, [returns]);

    useEffect(() => {
        if (!enabled || returns.length < 30) {
            // Only update if state actually changed
            setState(prev => {
                if (!prev.loading && prev.error?.message === 'Insufficient data') {
                    return prev; // No change needed
                }
                return {
                    ...prev,
                    loading: false,
                    error: returns.length < 30 ? new Error('Insufficient data') : null
                };
            });
            return;
        }

        const calculate = () => {
            try {
                const returnsSeries: ReturnsSeries = {
                    symbol: 'PORTFOLIO',
                    returns,
                    cumulativeReturns,
                    timestamps: Array.from({ length: returns.length }, (_, i) => Date.now() - (returns.length - i) * 86400000),
                    mean: 0,
                    median: 0,
                    stdDev: 0,
                    skewness: 0,
                    kurtosis: 0,
                    totalReturn: cumulativeReturns[cumulativeReturns.length - 1],
                    annualizedReturn: 0,
                    maxDrawdown: 0,
                    sharpeRatio: 0
                };

                const metrics = riskCalculator.calculateRiskMetrics(returnsSeries);

                setState({
                    metrics,
                    loading: false,
                    error: null,
                    lastUpdate: Date.now()
                });
            } catch (error) {
                console.error('[usePortfolioRisk] Error:', error);
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: error instanceof Error ? error : new Error('Unknown error')
                }));
            }
        };

        // Calculate once on mount or when returns change
        calculate();

        // Refresh periodically but don't cause infinite loops
        const interval = setInterval(calculate, refreshIntervalMs);

        return () => clearInterval(interval);
    }, [returns.length, enabled]); // Only re-run when returns count or enabled changes

    return state;
}

// Mock data generator
export function useMockReturns(days: number = 100): number[] {
    return useMemo(() => {
        const returns: number[] = [];

        for (let i = 0; i < days; i++) {
            const baseReturn = (Math.random() - 0.5) * 0.06;
            const drift = 0.0003;
            const prevReturn = i > 0 ? returns[i - 1] : 0;
            const momentum = prevReturn * 0.1;

            returns.push(baseReturn + drift + momentum);
        }

        return returns;
    }, [days]);
}
