import * as ccxt from 'ccxt';
import Redis from 'ioredis';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../config';
import { Logger } from '../utils/logger';

const logger = new Logger('PriceFeedService');

if (!CONFIG.SUPABASE.URL || !CONFIG.SUPABASE.KEY) {
    logger.error('❌ Missing Supabase configuration');
}

const redis = new Redis(CONFIG.REDIS_URL);
const supabase = CONFIG.SUPABASE.URL && CONFIG.SUPABASE.KEY
    ? createClient(CONFIG.SUPABASE.URL, CONFIG.SUPABASE.KEY)
    : null;

export class PriceFeedService {
    private exchange: ccxt.Exchange;
    private isRunning: boolean = false;

    constructor() {
        // Use Binance for demo (most reliable free API)
        this.exchange = new ccxt.binance({
            enableRateLimit: true
        });
    }

    async start() {
        if (this.isRunning) return;
        this.isRunning = true;

        logger.info('📈 Starting price feed service...');

        while (this.isRunning) {
            try {
                await this.fetchPrices();
                await this.sleep(CONFIG.TRADING.UPDATE_INTERVAL_MS);
            } catch (error) {
                logger.error('❌ Price feed error:', error);
                await this.sleep(CONFIG.TRADING.ERROR_WAIT_MS);
            }
        }
    }

    async fetchPrices() {
        try {
            const tickers = await this.exchange.fetchTickers(CONFIG.TRADING.SYMBOLS);

            for (const symbol of CONFIG.TRADING.SYMBOLS) {
                const ticker = tickers[symbol];
                if (!ticker) continue;

                const update = {
                    symbol,
                    price: ticker.last || 0,
                    bid: ticker.bid || 0,
                    ask: ticker.ask || 0,
                    volume_24h: ticker.quoteVolume || 0,
                    change_24h: ticker.percentage || 0,
                    timestamp: Date.now()
                };

                // Publish to Redis
                await redis.publish('price_updates', JSON.stringify(update));

                // Update database cache
                if (supabase) {
                    const { error } = await supabase
                        .from('market_data')
                        .upsert({
                            symbol,
                            price: update.price,
                            bid: update.bid,
                            ask: update.ask,
                            volume_24h: update.volume_24h,
                            change_24h: update.change_24h,
                            updated_at: new Date().toISOString()
                        });

                    if (error) {
                        logger.error(`Failed to update DB for ${symbol}:`, error);
                    }
                }
            }
        } catch (err) {
            logger.error('Error fetching tickers:', err);
            throw err;
        }
    }

    stop() {
        this.isRunning = false;
        logger.info('⏹️  Price feed service stopped');
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Auto-start if run directly
if (require.main === module) {
    const service = new PriceFeedService();
    service.start();

    process.on('SIGINT', () => {
        service.stop();
        process.exit(0);
    });
}
