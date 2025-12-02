from .base import BaseStrategy

class GridTradingStrategy(BaseStrategy):
    """
    GRID TRADING BOT (LƯỚI)
    Mua thấp bán cao trong range.
    Target: $250-500/ngày
    """
    
    def __init__(self, capital=10000, lower_price=40000, upper_price=45000, grids=10):
        super().__init__("Grid Trading Bot", capital)
        self.lower_price = lower_price
        self.upper_price = upper_price
        self.grid_count = grids
        self.grids = []
        self.setup_grid()

    def setup_grid(self):
        grid_spacing = (self.upper_price - self.lower_price) / self.grid_count
        for i in range(self.grid_count + 1):
            price = self.lower_price + i * grid_spacing
            self.grids.append({
                'price': price,
                'type': 'BUY' if i < self.grid_count / 2 else 'SELL', # Simple logic: Buy lower half, Sell upper half
                'filled': False
            })

    def generate_signal(self, current_price):
        signals = []
        for grid in self.grids:
            if not grid['filled']:
                if grid['type'] == 'BUY' and current_price <= grid['price']:
                    signals.append({
                        'action': 'BUY',
                        'price': grid['price'],
                        'reason': f'Grid Buy Level {grid["price"]}'
                    })
                    grid['filled'] = True
                    
                elif grid['type'] == 'SELL' and current_price >= grid['price']:
                    signals.append({
                        'action': 'SELL',
                        'price': grid['price'],
                        'reason': f'Grid Sell Level {grid["price"]}'
                    })
                    grid['filled'] = True
        
        return signals[0] if signals else None
