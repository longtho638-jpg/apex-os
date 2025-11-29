import gymnasium as gym
import numpy as np
import pandas as pd
from gymnasium import spaces
from typing import Tuple, Dict, Any

class TradingEnv(gym.Env):
    """
    Custom Trading Environment that follows gymnasium interface.
    """
    metadata = {'render_modes': ['human']}

    def __init__(self, df: pd.DataFrame, initial_balance: float = 10000.0):
        super(TradingEnv, self).__init__()

        self.df = df
        self.initial_balance = initial_balance
        
        # Actions: 0=HOLD, 1=BUY, 2=SELL
        self.action_space = spaces.Discrete(3)

        # Observations: [Open, High, Low, Close, Volume, RSI, MACD, Position_Status, Entry_Price, PnL]
        # Normalized to roughly [-1, 1] or [0, 1] where possible
        self.observation_space = spaces.Box(
            low=-np.inf, high=np.inf, shape=(10,), dtype=np.float32
        )

        self.reset()

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        
        self.balance = self.initial_balance
        self.position = 0  # 0=None, 1=Long (Simplified: No Short for now)
        self.entry_price = 0.0
        self.current_step = 0
        self.max_steps = len(self.df) - 1
        
        # Calculate indicators if not present (Simplified here, ideally pre-calculated)
        # Assuming df has 'rsi' and 'macd' columns already
        
        return self._next_observation(), {}

    def _next_observation(self):
        # Get current candle data
        obs = self.df.iloc[self.current_step]
        
        # Construct state vector
        state = np.array([
            obs['open'], obs['high'], obs['low'], obs['close'], obs['volume'],
            obs.get('rsi', 50), obs.get('macd', 0),
            self.position,
            self.entry_price,
            (self.balance - self.initial_balance) / self.initial_balance # Normalized PnL
        ], dtype=np.float32)
        
        return state

    def step(self, action: int) -> Tuple[np.ndarray, float, bool, bool, Dict[str, Any]]:
        current_price = self.df.iloc[self.current_step]['close']
        reward = 0
        terminated = False
        truncated = False
        
        # Execute Action
        if action == 1: # BUY
            if self.position == 0:
                self.position = 1
                self.entry_price = current_price
                # Fee penalty
                reward -= 0.001 * current_price 
        
        elif action == 2: # SELL
            if self.position == 1:
                self.position = 0
                # Calculate PnL
                pnl = current_price - self.entry_price
                reward += pnl
                self.balance += pnl
                self.entry_price = 0.0

        # HOLD (action=0): No direct reward, but maybe time penalty?
        
        # Update Step
        self.current_step += 1
        if self.current_step >= self.max_steps:
            terminated = True
            
        # Additional Reward: Portfolio Value Change
        # reward += (self.balance - prev_balance)
            
        obs = self._next_observation()
        info = {'balance': self.balance}
        
        return obs, reward, terminated, truncated, info

    def render(self, mode='human'):
        print(f'Step: {self.current_step}, Balance: {self.balance}, Position: {self.position}')
