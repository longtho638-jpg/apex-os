
import ccxt
import asyncio
from typing import List, Dict, Any

class CollectorAgent:
    def __init__(self, exchange_id: str = 'binance'):
        self.exchange_id = exchange_id
        self.exchange = getattr(ccxt, exchange_id)()
        self.is_running = False

    async def fetch_ticker(self, symbol: str) -> Dict[str, Any]:
        """
        Fetches the latest ticker data for a given symbol.
        """
        if self.exchange.has['fetchTicker']:
            ticker = await self.exchange.fetch_ticker(symbol)
            return ticker
        else:
            raise NotImplementedError(f"{self.exchange_id} does not support fetchTicker")


    async def fetch_btc_price(self):
        try:
            # Run blocking CCXT call in a thread
            ticker = await asyncio.to_thread(self.exchange.fetch_ticker, 'BTC/USDT')
            return {
                "symbol": "BTC",
                "price": ticker['last'],
                "change": ticker['change'],
                "change_percent": ticker['percentage']
            }
        except Exception as e:
            print(f"Error fetching BTC price: {e}")
            return None

    async def start_stream(self, symbols: List[str]):
        """
        Simulates a data stream (placeholder for WebSocket implementation).
        """
        self.is_running = True
        print(f"[{self.exchange_id}] Collector started for {symbols}")
        while self.is_running:
            # In a real implementation, this would be a WebSocket loop
            await asyncio.sleep(1)

    def stop(self):
        self.is_running = False
        print(f"[{self.exchange_id}] Collector stopped")

# Example usage
if __name__ == "__main__":
    agent = CollectorAgent()
    print(f"Initialized {agent.exchange_id} collector")
