from .base import BaseStrategy
from typing import Dict, Any
import pandas as pd
import numpy as np

class MomentumStrategy(BaseStrategy):
    def __init__(self, name: str, config: Dict[str, Any]):
        super().__init__(name, config)
        self.validate_config(['rsi_period', 'macd_fast', 'macd_slow', 'macd_signal'])

    def calculate_rsi(self, series: pd.Series, period: int = 14) -> pd.Series:
        delta = series.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        return 100 - (100 / (1 + rs))

    def calculate_macd(self, series: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9):
        exp1 = series.ewm(span=fast, adjust=False).mean()
        exp2 = series.ewm(span=slow, adjust=False).mean()
        macd = exp1 - exp2
        signal_line = macd.ewm(span=signal, adjust=False).mean()
        histogram = macd - signal_line
        return macd, signal_line, histogram

    async def analyze(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Momentum strategy analysis:
        - BUY if RSI < 30 (Oversold) AND MACD Histogram > 0 (Bullish Momentum)
        - SELL if RSI > 70 (Overbought) AND MACD Histogram < 0 (Bearish Momentum)
        """
        candles = market_data.get('candles', [])
        if not candles or len(candles) < 50:
            return {'action': 'HOLD', 'confidence': 0.0}

        # Convert to DataFrame
        df = pd.DataFrame(candles, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
        
        # Calculate Indicators
        rsi_period = self.config.get('rsi_period', 14)
        df['rsi'] = self.calculate_rsi(df['close'], rsi_period)
        
        macd_fast = self.config.get('macd_fast', 12)
        macd_slow = self.config.get('macd_slow', 26)
        macd_signal = self.config.get('macd_signal', 9)
        
        _, _, df['macd_hist'] = self.calculate_macd(df['close'], macd_fast, macd_slow, macd_signal)
        
        # Get latest values
        current_rsi = df['rsi'].iloc[-1]
        current_macd_hist = df['macd_hist'].iloc[-1]

        signal = {'action': 'HOLD', 'confidence': 0.0, 'metadata': {}}

        # Logic
        if current_rsi < 30 and current_macd_hist > 0:
            signal = {
                'action': 'BUY',
                'confidence': 0.85,
                'metadata': {'rsi': float(current_rsi), 'macd_hist': float(current_macd_hist)}
            }
        elif current_rsi > 70 and current_macd_hist < 0:
            signal = {
                'action': 'SELL',
                'confidence': 0.85,
                'metadata': {'rsi': float(current_rsi), 'macd_hist': float(current_macd_hist)}
            }

        return signal

    async def on_tick(self, market_data: Dict[str, Any]):
        if not self.is_active:
            return

        signal = await self.analyze(market_data)
        if signal['action'] != 'HOLD':
            self.log_signal(signal)
            # Publish signal to Redis
            if signal['action'] != 'HOLD':
                await self.publish_signal(signal)
                
    async def publish_signal(self, signal: dict):
        try:
            import redis.asyncio as redis
            import os
            redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
            r = redis.from_url(redis_url)
            await r.publish('trade_signals', json.dumps(signal))
            await r.aclose()
        except Exception as e:
            self.logger.error(f"Failed to publish signal: {e}")
