from .base import BaseStrategy
import pandas as pd

class ScalpingStrategy(BaseStrategy):
    """
    SCALPING VỚI ALGO (CẦU NỐI)
    Mua khi RSI < 30, bán khi RSI > 70
    Target: $50-200/ngày
    """
    
    def __init__(self, capital=1000, rsi_period=14):
        super().__init__("Scalping Bot", capital)
        self.rsi_period = rsi_period
        self.position_size = capital * 0.02  # 2% per trade

    def calculate_rsi(self, prices):
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=self.rsi_period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=self.rsi_period).mean()
        rs = gain / loss
        return 100 - (100 / (1 + rs))

    def generate_signal(self, market_data):
        # market_data expected to be a DataFrame with 'close'
        rsi = self.calculate_rsi(market_data['close']).iloc[-1]
        current_price = market_data['close'].iloc[-1]
        
        if rsi < 30:
            return {
                'action': 'BUY',
                'price': current_price,
                'confidence': 0.8,
                'stop_loss': current_price * 0.995,
                'take_profit': current_price * 1.01,
                'reason': f'RSI Oversold ({rsi:.2f})'
            }
        elif rsi > 70:
            return {
                'action': 'SELL',
                'price': current_price,
                'confidence': 0.8,
                'reason': f'RSI Overbought ({rsi:.2f})'
            }
        return None
