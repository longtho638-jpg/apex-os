import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

export const CONFIG = {
    PORT: process.env.PORT || 8080,
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    SUPABASE: {
        URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!
    },
    TRADING: {
        SYMBOLS: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'],
        UPDATE_INTERVAL_MS: 1000,
        ERROR_WAIT_MS: 5000,
        EXCHANGE_ID: 'binance'
    },
    RISK: {
        MAX_LEVERAGE: 10,
        MAX_EXPOSURE_PERCENT: 80,
        MARGIN_REQUIREMENT: 0.1, // 10%
        LIQUIDATION_THRESHOLDS: {
            CRITICAL: 70,
            HIGH: 50,
            MEDIUM: 30
        }
    }
};
