from .base import BaseStrategy
from datetime import datetime

class CopyTradingStrategy(BaseStrategy):
    """
    COPY TRADING SIGNALS (BÁN TÍN HIỆU)
    Target: $5,000/tháng
    """
    
    def __init__(self, capital=0):
        super().__init__("Copy Trading Bot", capital)
        self.subscribers = []
        self.price_per_month = 50

    def generate_signal(self, market_data):
        # This strategy doesn't trade itself, it generates signals for others
        # Logic: Simple MA Crossover for demo
        
        current_price = market_data['close'].iloc[-1]
        sma_20 = market_data['close'].rolling(window=20).mean().iloc[-1]
        sma_50 = market_data['close'].rolling(window=50).mean().iloc[-1]
        
        if sma_20 > sma_50:
             return {
                'action': 'BROADCAST_SIGNAL',
                'type': 'BUY',
                'symbol': 'BTCUSDT',
                'price': current_price,
                'confidence': 0.85,
                'stop_loss': current_price * 0.98,
                'take_profit': current_price * 1.02,
                'timestamp': datetime.now().isoformat()
            }
        
        return None
