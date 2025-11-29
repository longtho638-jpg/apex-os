import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CONFIG } from '../config';
import { Logger } from '../utils/logger';

const logger = new Logger('SignalGenerator');

interface Signal {
    symbol: string;
    type: 'BUY' | 'SELL' | 'HOLD';
    reason: string;
    confidence: number;
    indicators: {
        rsi?: number;
        macd?: { macd: number; signal: number; histogram: number };
    };
    timestamp: number;
}

export class SignalGenerator {
    private supabase: SupabaseClient;

    constructor() {
        if (!CONFIG.SUPABASE.URL || !CONFIG.SUPABASE.KEY) {
            throw new Error('Missing Supabase configuration');
        }
        this.supabase = createClient(CONFIG.SUPABASE.URL, CONFIG.SUPABASE.KEY);
    }

    // RSI (Relative Strength Index) calculation
    calculateRSI(prices: number[], period: number = 14): number {
        if (prices.length < period + 1) return 50;

        const gains: number[] = [];
        const losses: number[] = [];

        for (let i = 1; i < prices.length; i++) {
            const diff = prices[i] - prices[i - 1];
            gains.push(diff > 0 ? diff : 0);
            losses.push(diff < 0 ? Math.abs(diff) : 0);
        }

        const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
        const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

        if (avgLoss === 0) return 100;

        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));

        return rsi;
    }

    // MACD (Moving Average Convergence Divergence)
    calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
        const ema12 = this.calculateEMA(prices, 12);
        const ema26 = this.calculateEMA(prices, 26);
        const macd = ema12 - ema26;

        // Signal line is 9-period EMA of MACD
        const macdHistory = [macd]; // In production, calculate full history
        const signal = macd; // Simplified
        const histogram = macd - signal;

        return { macd, signal, histogram };
    }

    private calculateEMA(prices: number[], period: number): number {
        if (prices.length === 0) return 0;
        if (prices.length < period) return prices[prices.length - 1];

        const multiplier = 2 / (period + 1);
        let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

        for (let i = period; i < prices.length; i++) {
            ema = (prices[i] - ema) * multiplier + ema;
        }

        return ema;
    }

    async generateSignal(symbol: string): Promise<Signal> {
        try {
            // Fetch recent price history
            const { data: marketData } = await this.supabase
                .from('market_data')
                .select('price, updated_at')
                .eq('symbol', symbol)
                .order('updated_at', { ascending: false })
                .limit(50);

            if (!marketData || marketData.length < 14) {
                return {
                    symbol,
                    type: 'HOLD',
                    reason: 'Insufficient data',
                    confidence: 0,
                    indicators: {},
                    timestamp: Date.now()
                };
            }

            const prices = marketData.map(d => Number(d.price)).reverse();
            const currentPrice = prices[prices.length - 1];

            // Calculate indicators
            const rsi = this.calculateRSI(prices);
            const macd = this.calculateMACD(prices);

            // Generate signal based on indicators
            let type: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
            let reason = 'Neutral market conditions';
            let confidence = 0.5;

            // RSI-based signals
            if (rsi < 30) {
                type = 'BUY';
                reason = `RSI oversold (${rsi.toFixed(1)})`;
                confidence = 0.7;
            } else if (rsi > 70) {
                type = 'SELL';
                reason = `RSI overbought (${rsi.toFixed(1)})`;
                confidence = 0.7;
            }

            // MACD confirmation
            if (macd.histogram > 0 && macd.macd > macd.signal) {
                if (type === 'BUY') {
                    confidence = Math.min(0.9, confidence + 0.2);
                    reason += ', MACD bullish crossover';
                } else if (type === 'HOLD') {
                    type = 'BUY';
                    reason = 'MACD bullish momentum';
                    confidence = 0.6;
                }
            } else if (macd.histogram < 0 && macd.macd < macd.signal) {
                if (type === 'SELL') {
                    confidence = Math.min(0.9, confidence + 0.2);
                    reason += ', MACD bearish crossover';
                } else if (type === 'HOLD') {
                    type = 'SELL';
                    reason = 'MACD bearish momentum';
                    confidence = 0.6;
                }
            }

            const signal: Signal = {
                symbol,
                type,
                reason,
                confidence,
                indicators: { rsi, macd },
                timestamp: Date.now()
            };

            // Save signal to database
            await this.saveSignal(signal);

            logger.info(`Signal generated for ${symbol}: ${type} (confidence: ${(confidence * 100).toFixed(0)}%)`);

            return signal;
        } catch (error) {
            logger.error(`Failed to generate signal for ${symbol}:`, error);
            return {
                symbol,
                type: 'HOLD',
                reason: 'Error generating signal',
                confidence: 0,
                indicators: {},
                timestamp: Date.now()
            };
        }
    }

    async generateAllSignals(symbols: string[]): Promise<Signal[]> {
        const signals = await Promise.all(
            symbols.map(symbol => this.generateSignal(symbol))
        );
        return signals;
    }

    private async saveSignal(signal: Signal) {
        try {
            await this.supabase
                .from('trading_signals')
                .insert({
                    symbol: signal.symbol,
                    signal_type: signal.type,
                    reason: signal.reason,
                    confidence: signal.confidence,
                    indicators: signal.indicators,
                    created_at: new Date(signal.timestamp).toISOString()
                });
        } catch (error) {
            logger.error('Failed to save signal:', error);
        }
    }
}
