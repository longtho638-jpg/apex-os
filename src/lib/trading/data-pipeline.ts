import { logger } from '@/lib/logger';
import { BinanceClient } from './binance-client';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const binance = new BinanceClient({
    apiKey: process.env.BINANCE_API_KEY || '',
    apiSecret: process.env.BINANCE_SECRET || ''
});

export interface OHLCV {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export class DataPipeline {
    
    async fetchAndStoreCandles(symbol: string, interval: string) {
        try {
            const rawData = await binance.getKlines(symbol, interval, 100); // Fetch last 100
            
            const candles: OHLCV[] = rawData.map((d: any[]) => ({
                timestamp: d[0],
                open: parseFloat(d[1]),
                high: parseFloat(d[2]),
                low: parseFloat(d[3]),
                close: parseFloat(d[4]),
                volume: parseFloat(d[5])
            }));

            // Store in Supabase
            const rows = candles.map(c => ({
                symbol,
                interval,
                open: c.open,
                high: c.high,
                low: c.low,
                close: c.close,
                volume: c.volume,
                timestamp: new Date(c.timestamp).toISOString()
            }));

            const { error } = await supabase
                .from('market_data_ohlcv')
                .upsert(rows, { onConflict: 'symbol,interval,timestamp' });

            if (error) throw error;

            logger.info(`Stored ${rows.length} candles for ${symbol} ${interval}`);
            return true;
        } catch (error) {
            logger.error(`Pipeline Error (${symbol}):`, error);
            return false;
        }
    }

    async startRealtimeIngestion(symbols: string[]) {
        // This would typically be a websocket connection
        // For now, we'll just poll every minute
        logger.info(`Starting polling for ${symbols.join(', ')}...`);
        // Logic to be implemented in cron or separate worker
    }
}
