import os
import time
import schedule
import logging
from datetime import datetime
import ccxt
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("DataAgent")

class DataAgent:
    def __init__(self):
        self.exchange = ccxt.binance({
            'apiKey': os.getenv('BINANCE_API_KEY'),
            'secret': os.getenv('BINANCE_SECRET'),
            'enableRateLimit': True,
        })
        # Symbols to track
        self.symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT']
        self.timeframes = ['1m', '15m', '1h', '4h', '1d']

    def fetch_ohlcv(self, symbol, timeframe):
        try:
            logger.info(f"Fetching {symbol} {timeframe}...")
            ohlcv = self.exchange.fetch_ohlcv(symbol, timeframe, limit=100)
            # In a real scenario, we would push this to Supabase or a TimeSeries DB
            # For now, just logging the success
            logger.info(f"Fetched {len(ohlcv)} candles for {symbol}")
            return ohlcv
        except Exception as e:
            logger.error(f"Error fetching {symbol}: {e}")
            return None

    def run_collection_cycle(self):
        logger.info("Starting collection cycle...")
        for symbol in self.symbols:
            for tf in self.timeframes:
                self.fetch_ohlcv(symbol, tf)
        logger.info("Cycle complete.")

    def start(self):
        logger.info("Data Agent Started")
        # Schedule jobs
        schedule.every(1).minutes.do(self.run_collection_cycle)
        
        # Run immediately once
        self.run_collection_cycle()

        while True:
            schedule.run_pending()
            time.sleep(1)

if __name__ == "__main__":
    agent = DataAgent()
    agent.start()
