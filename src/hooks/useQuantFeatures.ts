/**
 * React Hook for Quantitative Features
 * 
 * Provides real-time quantitative features for trading signals.
 */

import { useState, useEffect, useMemo } from 'react';
import { quantEngine } from '@/lib/quant/FeatureEngine';
import type { TechnicalFeatures, OHLCV, Timeframe } from '@/lib/quant/types';

interface UseQuantFeaturesOptions {
    symbol: string;
    timeframe?: Timeframe;
    enabled?: boolean;
}

interface QuantFeaturesState {
    features: TechnicalFeatures | null;
    loading: boolean;
    error: Error | null;
    lastUpdate: number;
}

/**
 * Hook to calculate and provide quantitative features for a symbol
 * 
 * @example
 * const { features, loading } = useQuantFeatures({ symbol: 'BTCUSDT', timeframe: '1h' });
 * if (features) {
 *   console.log('RSI:', features.momentum.rsi);
 *   console.log('Trend:', features.trend.trend);
 * }
 */
export function useQuantFeatures({
    symbol,
    timeframe = '1h',
    enabled = true
}: UseQuantFeaturesOptions): QuantFeaturesState {
    const [state, setState] = useState<QuantFeaturesState>({
        features: null,
        loading: true,
        error: null,
        lastUpdate: 0
    });

    useEffect(() => {
        if (!enabled || !symbol) {
            setState(prev => ({ ...prev, loading: false }));
            return;
        }

        const calculateFeatures = async () => {
            try {
                setState(prev => ({ ...prev, loading: true, error: null }));

                // Fetch historical candles
                // TODO: Replace with actual data fetch from your API/WebSocket
                const candles = await fetchHistoricalCandles(symbol, timeframe);

                if (candles.length < 200) {
                    throw new Error(`Insufficient data: got ${candles.length} candles, need 200+`);
                }

                // Calculate features
                const features = quantEngine.calculateFeatures(candles);

                setState({
                    features,
                    loading: false,
                    error: null,
                    lastUpdate: Date.now()
                });
            } catch (error) {
                console.error('[useQuantFeatures] Calculation error:', error);
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: error instanceof Error ? error : new Error('Unknown error')
                }));
            }
        };

        calculateFeatures();

        // Recalculate on interval (every 1 minute for 1m timeframe, etc.)
        const intervalMs = getIntervalMs(timeframe);
        const interval = setInterval(calculateFeatures, intervalMs);

        return () => clearInterval(interval);
    }, [symbol, timeframe, enabled]);

    return state;
}

/**
 * Simplified hook that returns just the features (no loading/error states)
 * Useful when you're already handling loading states elsewhere
 */
export function useQuantFeaturesSimple(symbol: string, timeframe: Timeframe = '1h'): TechnicalFeatures | null {
    const { features } = useQuantFeatures({ symbol, timeframe });
    return features;
}

/**
 * Hook to calculate features from pre-loaded candle data
 * Useful when you already have the candle data and don't need to fetch
 */
export function useQuantFeaturesFromCandles(candles: OHLCV[]): TechnicalFeatures | null {
    return useMemo(() => {
        if (!candles || candles.length < 200) {
            return null;
        }

        try {
            return quantEngine.calculateFeatures(candles);
        } catch (error) {
            console.error('[useQuantFeaturesFromCandles] Error:', error);
            return null;
        }
    }, [candles]);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fetch historical candles for a symbol
 * TODO: Integrate with your actual data source
 */
async function fetchHistoricalCandles(symbol: string, timeframe: Timeframe): Promise<OHLCV[]> {
    // Placeholder implementation
    // Replace this with actual API call to your backend or exchange API

    console.warn('[fetchHistoricalCandles] Using mock data - implement actual data fetch');

    // Generate mock candles for development
    const mockCandles: OHLCV[] = [];
    const now = Date.now();
    const intervalMs = getIntervalMs(timeframe);

    for (let i = 300; i > 0; i--) {
        const timestamp = now - (i * intervalMs);
        const basePrice = 50000 + Math.sin(i / 10) * 5000;
        const noise = Math.random() * 1000 - 500;
        const open = basePrice + noise;
        const high = open + Math.random() * 500;
        const low = open - Math.random() * 500;
        const close = low + Math.random() * (high - low);

        mockCandles.push({
            timestamp,
            open,
            high,
            low,
            close,
            volume: Math.random() * 1000000
        });
    }

    return mockCandles;
}

/**
 * Get interval in milliseconds for a timeframe
 */
function getIntervalMs(timeframe: Timeframe): number {
    const intervals: Record<Timeframe, number> = {
        '1m': 60 * 1000,
        '5m': 5 * 60 * 1000,
        '15m': 15 * 60 * 1000,
        '1h': 60 * 60 * 1000,
        '4h': 4 * 60 * 60 * 1000,
        '1d': 24 * 60 * 60 * 1000
    };
    return intervals[timeframe] || 60 * 60 * 1000;
}
