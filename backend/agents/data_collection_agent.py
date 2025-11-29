import asyncio
import os
import sys
from datetime import datetime, timedelta, timezone
from supabase import create_client, Client
import ccxt.async_support as ccxt
from dotenv import load_dotenv

# Load env vars
load_dotenv()

class DataCollectionAgent:
    def __init__(self):
        url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        if not url or not key:
            raise ValueError("Supabase credentials not found")
        
        self.supabase: Client = create_client(url, key)
        self.symbols = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'] # CCXT uses / format
        self.intervals = ['1m', '5m', '15m', '1h', '4h', '1d']
        
        self.exchange = ccxt.binance({
            'enableRateLimit': True,
            'options': {
                'defaultType': 'spot'
            }
        })

    async def close(self):
        await self.exchange.close()

    async def backfill_historical(self, days=90):
        """Backfill last 90 days of data"""
        end_time = datetime.now(timezone.utc)
        start_time = end_time - timedelta(days=days)
        
        for symbol in self.symbols:
            for interval in self.intervals:
                print(f"Backfilling {symbol} {interval}...")
                await self.fetch_and_store(symbol, interval, start_time, end_time)

    async def fetch_and_store(self, symbol, interval, start_time: datetime, end_time: datetime):
        """Fetch from Binance and store in Supabase"""
        # Convert to timestamps (ms)
        since = int(start_time.timestamp() * 1000)
        end_ts = int(end_time.timestamp() * 1000)
        
        db_symbol = symbol.replace('/', '') # BTC/USDT -> BTCUSDT
        
        all_klines = []
        
        while since < end_ts:
            try:
                # Binance limit is usually 1000 per request
                klines = await self.exchange.fetch_ohlcv(symbol, interval, since, limit=1000)
                if not klines:
                    break
                
                all_klines.extend(klines)
                
                # Update since to last candle time + 1ms
                last_time = klines[-1][0]
                if last_time >= end_ts:
                    break
                since = last_time + 1
                
                # Minimal sleep to be safe with rate limits even with enableRateLimit=True
                await asyncio.sleep(0.1) 
                
            except Exception as e:
                print(f"Error fetching {symbol} {interval}: {e}")
                await asyncio.sleep(5)
                continue

        if not all_klines:
            return

        # Transform and Batch Insert
        records = []
        for kline in all_klines:
            # kline: [timestamp, open, high, low, close, volume]
            # Note: ccxt returns standard OHLCV. Binance might have quote volume etc in info
            # We'll fit what we have.
            
            # Binance sends close time in raw response but ccxt standardizes.
            # We need to calculate close_time or use info if available.
            # Interval to ms:
            duration_seconds = self.exchange.parse_timeframe(interval)
            open_ts = kline[0]
            close_ts = open_ts + (duration_seconds * 1000) - 1
            
            records.append({
                'symbol': db_symbol,
                'interval': interval,
                'open_time': datetime.fromtimestamp(open_ts / 1000, timezone.utc).isoformat(),
                'open': float(kline[1]),
                'high': float(kline[2]),
                'low': float(kline[3]),
                'close': float(kline[4]),
                'volume': float(kline[5]),
                'close_time': datetime.fromtimestamp(close_ts / 1000, timezone.utc).isoformat(),
                # Quote volume/Trades not always in standard CCXT OHLCV, 
                # but often in 'info' if we fetch differently. 
                # For now, leave optional or 0.
                'quote_volume': 0,
                'trades': 0
            })

        # Upsert in batches of 1000
        batch_size = 1000
        for i in range(0, len(records), batch_size):
            batch = records[i:i+batch_size]
            try:
                self.supabase.table('market_data_ohlcv').upsert(
                    batch,
                    on_conflict='symbol,interval,open_time'
                ).execute()
                print(f"Stored {len(batch)} records for {symbol} {interval} (Batch {i//batch_size + 1})")
            except Exception as e:
                print(f"Error inserting batch: {e}")

    async def run_realtime_collection(self):
        """Continuous collection (run as cron every 1 minute)"""
        print("Starting Realtime Collection...")
        try:
            for symbol in self.symbols:
                # Collect recent data (last 2 hours to cover any gaps)
                await self.fetch_and_store(
                    symbol, 
                    '1m', 
                    datetime.now(timezone.utc) - timedelta(hours=2),
                    datetime.now(timezone.utc)
                )
                # Also update other timeframes if needed, or rely on aggregation?
                # Usually real-time relies on 1m and aggregates, or we fetch others less frequently.
                # The requirements say "Continuous collection".
                # For MVP, we'll fetch '1m' frequently.
            
            # Refresh materialized view
            try:
                self.supabase.rpc('refresh_latest_prices').execute()
                print("Refreshed materialized view")
            except Exception as e:
                print(f"Error refreshing view: {e}")
                
        except Exception as e:
            print(f"Realtime loop error: {e}")
        finally:
            await self.close()

if __name__ == '__main__':
    agent = DataCollectionAgent()
    loop = asyncio.get_event_loop()
    
    try:
        if '--backfill' in sys.argv:
            loop.run_until_complete(agent.backfill_historical(days=90))
        else:
            loop.run_until_complete(agent.run_realtime_collection())
    finally:
        # loop.run_until_complete(agent.close()) # handled in realtime logic or here
        pass
