import asyncio
import os
import json
import redis.asyncio as redis
from dotenv import load_dotenv
from ..strategies.rl_strategy import RLStrategy
from ..services.market_data import MarketDataService

load_dotenv()

REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')

class LiveTrader:
    def __init__(self, symbol: str, strategy_config: dict):
        self.symbol = symbol
        # Switch to RL Strategy
        self.strategy = RLStrategy("PPO_Agent_1", strategy_config)
        self.market_data = MarketDataService('binance')
        self.redis = redis.from_url(REDIS_URL)
        self.is_running = False

    async def start(self):
        self.is_running = True
        print(f"🚀 Starting Live Trader for {self.symbol}")
        
        while self.is_running:
            try:
                # 1. Fetch Data
                candles = await self.market_data.fetch_candles(self.symbol, '1m', limit=100)
                ticker = await self.market_data.fetch_ticker(self.symbol)
                
                market_payload = {
                    'candles': candles,
                    'ticker': ticker
                }

                # 2. Analyze
                signal = await self.strategy.analyze(market_payload)
                
                # 3. Publish Signal if Actionable
                if signal['action'] != 'HOLD':
                    payload = {
                        'symbol': self.symbol,
                        'action': signal['action'],
                        'confidence': signal['confidence'],
                        'price': ticker['last'],
                        'timestamp': ticker['timestamp'],
                        'metadata': signal['metadata']
                    }
                    print(f"⚡ Signal Generated: {payload}")
                    await self.redis.publish('trade_signals', json.dumps(payload))

                # Heartbeat
                await self.redis.publish('agent_heartbeats', json.dumps({
                    'agent_id': f"trader_{self.symbol}",
                    'status': 'online',
                    'last_check': ticker['timestamp']
                }))

            except Exception as e:
                print(f"❌ Error in trade loop: {e}")
            
            await asyncio.sleep(60) # Run every minute

    async def stop(self):
        self.is_running = False
        await self.redis.close()

if __name__ == "__main__":
    # Example Usage
    config = {
        'rsi_period': 14,
        'macd_fast': 12,
        'macd_slow': 26,
        'macd_signal': 9
    }
    trader = LiveTrader('BTC/USDT', config)
    try:
        asyncio.run(trader.start())
    except KeyboardInterrupt:
        asyncio.run(trader.stop())
