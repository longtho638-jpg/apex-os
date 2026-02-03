import { logger } from '@/lib/logger';
/**
 * Hook to maintain rolling price history and calculate technical indicators
 * 
 * Stores last 200 candles for accurate indicator calculations
 */

import { useState, useEffect, useCallback } from 'react';
import { TechnicalCalculator } from '@/lib/quant/TechnicalCalculator';

interface PriceCandle {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    timestamp: number;
}

interface CalculatedIndicators {
    ema9: number;
    ema20: number;
    ema50: number;
    ema200: number;
    rsi: number;
    macd: {
        value: number;
        signal: number;
        histogram: number;
        bullish: boolean;
        bearish: boolean;
    };
    atr14: number;
    bollingerBands: {
        upper: number;
        middle: number;
        lower: number;
        bandwidth: number;
        percentB: number;
        squeeze: boolean;
    };
}

const MAX_CANDLES = 200;

export function useTechnicalIndicators(symbol: string) {
    const [candles, setCandles] = useState<PriceCandle[]>([]);
    const [indicators, setIndicators] = useState<CalculatedIndicators | null>(null);
    const [loading, setLoading] = useState(true);

    // Add new price data point
    const addCandle = useCallback((candle: PriceCandle) => {
        setCandles(prev => {
            const updated = [...prev, candle];
            // Keep only last MAX_CANDLES
            return updated.length > MAX_CANDLES
                ? updated.slice(-MAX_CANDLES)
                : updated;
        });
    }, []);

    // Update latest candle (for real-time updates within same period)
    const updateLatestCandle = useCallback((price: number, volume: number) => {
        setCandles(prev => {
            if (prev.length === 0) return prev;

            const updated = [...prev];
            const latest = updated[updated.length - 1];

            updated[updated.length - 1] = {
                ...latest,
                high: Math.max(latest.high, price),
                low: Math.min(latest.low, price),
                close: price,
                volume: latest.volume + volume
            };

            return updated;
        });
    }, []);

    // Calculate indicators whenever candles update
    useEffect(() => {
        if (candles.length < 50) {
            setLoading(true);
            return; // Need minimum data
        }

        try {
            const prices = candles.map(c => c.close);
            const highs = candles.map(c => c.high);
            const lows = candles.map(c => c.low);
            const volumes = candles.map(c => c.volume);

            const calculated = TechnicalCalculator.calculateAll(
                prices,
                highs,
                lows,
                volumes
            );

            setIndicators(calculated as CalculatedIndicators);
            setLoading(false);
        } catch (error) {
            logger.error('[useTechnicalIndicators] Calculation error:', error);
            setLoading(false);
        }
    }, [candles]);

    return {
        indicators,
        loading,
        addCandle,
        updateLatestCandle,
        candleCount: candles.length
    };
}
