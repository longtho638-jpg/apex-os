import ccxt.async_support as ccxt
import asyncio
from typing import List, Dict, Any

class MarketDataService:
    def __init__(self, exchange_id: str = 'binance'):
        self.exchange_id = exchange_id
        self.exchange = getattr(ccxt, exchange_id)()

    async def fetch_candles(self, symbol: str, timeframe: str = '1h', limit: int = 100) -> List[List[float]]:
        """
        Fetch OHLCV candles from the exchange.
        Returns: [[timestamp, open, high, low, close, volume], ...]
        """
        try:
            if not self.exchange.has['fetchOHLCV']:
                raise NotImplementedError(f"{self.exchange_id} does not support fetchOHLCV")

            candles = await self.exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
            return candles
        except Exception as e:
            print(f"Error fetching candles for {symbol}: {e}")
            return []
        finally:
            await self.exchange.close()

    async def fetch_ticker(self, symbol: str) -> Dict[str, Any]:
        try:
            ticker = await self.exchange.fetch_ticker(symbol)
            return ticker
        except Exception as e:
            print(f"Error fetching ticker for {symbol}: {e}")
            return {}
        finally:
            await self.exchange.close()
