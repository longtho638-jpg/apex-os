from .base import BaseStrategy
from typing import Dict, Any
import numpy as np
import os
from stable_baselines3 import PPO
from ..ml.env import TradingEnv

class RLStrategy(BaseStrategy):
    def __init__(self, name: str, config: Dict[str, Any]):
        super().__init__(name, config)
        self.model_path = os.path.join(os.path.dirname(__file__), '..', 'ml', 'saved_models', 'ppo_trader')
        self.model = self._load_model()
        # We need a dummy env or similar logic to construct observations
        # For simplicity, we'll replicate the observation construction logic here
        self.position = 0
        self.entry_price = 0.0
        self.initial_balance = 10000.0
        self.balance = 10000.0

    def _load_model(self):
        try:
            # Check if zip exists
            if os.path.exists(f"{self.model_path}.zip"):
                model = PPO.load(self.model_path)
                self.logger.info(f"✅ Loaded RL model from {self.model_path}")
                return model
            else:
                self.logger.error(f"❌ Model not found at {self.model_path}")
                return None
        except Exception as e:
            self.logger.error(f"Failed to load RL model: {e}")
            return None

    def _construct_observation(self, candle: Dict[str, Any]):
        # [Open, High, Low, Close, Volume, RSI, MACD, Position, Entry, PnL]
        # We need to calculate RSI/MACD on the fly or get them from the candle if available
        # For this demo, we'll assume they are passed or mock them
        
        rsi = candle.get('rsi', 50)
        macd = candle.get('macd', 0)
        
        obs = np.array([
            candle['open'], candle['high'], candle['low'], candle['close'], candle['volume'],
            rsi, macd,
            self.position,
            self.entry_price,
            (self.balance - self.initial_balance) / self.initial_balance
        ], dtype=np.float32)
        return obs

    async def analyze(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.model:
            return {'action': 'HOLD', 'confidence': 0.0, 'metadata': {'error': 'No model'}}

        candles = market_data.get('candles', [])
        if not candles:
            return {'action': 'HOLD', 'confidence': 0.0}

        # Get latest candle
        latest_candle_list = candles[-1] # [ts, o, h, l, c, v]
        latest_candle = {
            'open': latest_candle_list[1],
            'high': latest_candle_list[2],
            'low': latest_candle_list[3],
            'close': latest_candle_list[4],
            'volume': latest_candle_list[5],
            # Mock indicators for now as they aren't in the raw candle list
            'rsi': 50 + np.random.normal(0, 5),
            'macd': 0 + np.random.normal(0, 0.1)
        }

        obs = self._construct_observation(latest_candle)
        
        # Inference
        action, _states = self.model.predict(obs, deterministic=True)
        
        # Map Action: 0=HOLD, 1=BUY, 2=SELL
        signal = {'action': 'HOLD', 'confidence': 1.0, 'metadata': {'model': 'PPO_RL', 'rl_action': int(action)}}
        
        if action == 1: # BUY
            if self.position == 0:
                signal['action'] = 'BUY'
                # Update internal state (simplified)
                self.position = 1
                self.entry_price = latest_candle['close']
        
        elif action == 2: # SELL
            if self.position == 1:
                signal['action'] = 'SELL'
                # Update internal state
                pnl = latest_candle['close'] - self.entry_price
                self.balance += pnl
                self.position = 0
                self.entry_price = 0.0

        return signal

    async def on_tick(self, market_data: Dict[str, Any]):
        if not self.is_active:
            return
        
        signal = await self.analyze(market_data)
        if signal['action'] != 'HOLD':
            self.log_signal(signal)
