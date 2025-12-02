from .base import BaseStrategy

class DCABot(BaseStrategy):
    """
    DCA BOT (TRUNG BÌNH GIÁ)
    Mua $100 mỗi ngày bất kể giá.
    Target: 50% lợi nhuận/năm
    """
    
    def __init__(self, capital=10000, daily_investment=100):
        super().__init__("DCA Bot", capital)
        self.daily_investment = daily_investment
        self.portfolio = {}

    def generate_signal(self, current_price, symbol='BTC'):
        # DCA logic is time-based, but here we simulate a "Daily" trigger
        # In a real system, this would be triggered by a cron job
        
        return {
            'action': 'BUY',
            'symbol': symbol,
            'amount_usd': self.daily_investment,
            'price': current_price,
            'reason': 'Daily DCA Trigger'
        }

    def update_portfolio(self, symbol, price, amount_usd):
        quantity = amount_usd / price
        
        if symbol not in self.portfolio:
            self.portfolio[symbol] = {
                'total_cost': 0,
                'total_quantity': 0,
                'average_price': 0
            }
        
        self.portfolio[symbol]['total_cost'] += amount_usd
        self.portfolio[symbol]['total_quantity'] += quantity
        self.portfolio[symbol]['average_price'] = \
            self.portfolio[symbol]['total_cost'] / self.portfolio[symbol]['total_quantity']
