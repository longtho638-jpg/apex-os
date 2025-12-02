from .base import BaseStrategy

class ArbitrageStrategy(BaseStrategy):
    """
    ARBITRAGE BOT (CHÊNH LỆCH GIÁ)
    So sánh giá giữa Binance và OKX.
    Target: $3,000/tháng
    """
    
    def __init__(self, capital=10000, min_spread_percent=0.1):
        super().__init__("Arbitrage Bot", capital)
        self.min_spread_percent = min_spread_percent

    def find_opportunities(self, prices):
        """
        prices: dict {'Binance': 50000, 'OKX': 50050}
        """
        opportunities = []
        
        binance_price = prices.get('Binance')
        okx_price = prices.get('OKX')
        
        if not binance_price or not okx_price:
            return []
            
        spread = abs(binance_price - okx_price)
        spread_percent = (spread / min(binance_price, okx_price)) * 100
        
        if spread_percent > self.min_spread_percent:
            if binance_price < okx_price:
                opportunities.append({
                    'action': 'ARBITRAGE',
                    'buy_exchange': 'Binance',
                    'sell_exchange': 'OKX',
                    'buy_price': binance_price,
                    'sell_price': okx_price,
                    'spread': spread_percent,
                    'estimated_profit': spread
                })
            else:
                opportunities.append({
                    'action': 'ARBITRAGE',
                    'buy_exchange': 'OKX',
                    'sell_exchange': 'Binance',
                    'buy_price': okx_price,
                    'sell_price': binance_price,
                    'spread': spread_percent,
                    'estimated_profit': spread
                })
                
        return opportunities
