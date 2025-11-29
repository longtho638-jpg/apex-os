import gymnasium as gym
import pandas as pd
import numpy as np
from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env
from ..ml.env import TradingEnv
import os

def generate_data(n=2000):
    """Generate synthetic data with indicators"""
    t = np.linspace(0, 100, n)
    price = np.sin(t) * 10 + 100 + np.random.normal(0, 1, n)
    
    df = pd.DataFrame({
        'open': price,
        'high': price + 1,
        'low': price - 1,
        'close': price + np.random.normal(0, 0.5, n),
        'volume': np.random.randint(100, 1000, n)
    })
    
    # Calculate simple indicators
    df['rsi'] = np.random.uniform(30, 70, n) # Mock RSI
    df['macd'] = np.random.uniform(-1, 1, n) # Mock MACD
    
    return df

def train_rl():
    print("🤖 Starting RL Agent Training (PPO)...")
    
    # 1. Prepare Data & Env
    df = generate_data()
    env = TradingEnv(df)
    
    # 2. Initialize Agent
    model = PPO("MlpPolicy", env, verbose=1, learning_rate=0.0003)
    
    # 3. Train
    print("Training for 10,000 timesteps...")
    model.learn(total_timesteps=10000)
    
    # 4. Save
    save_path = os.path.join(os.path.dirname(__file__), 'saved_models', 'ppo_trader')
    model.save(save_path)
    print(f"✅ Model saved to {save_path}.zip")

if __name__ == "__main__":
    train_rl()
