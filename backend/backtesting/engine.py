import pandas as pd
from typing import Dict, Any, List
from datetime import datetime
from ..strategies.base import BaseStrategy

class BacktestEngine:
    def __init__(self, strategy: BaseStrategy, initial_capital: float = 10000.0):
        self.strategy = strategy
        self.initial_capital = initial_capital
        self.capital = initial_capital
        self.position = None
        self.trades = []
        self.equity_curve = []

    def run(self, candles: List[List[float]]):
        """
        Run backtest on historical candles.
        Candle format: [timestamp, open, high, low, close, volume]
        """
        df = pd.DataFrame(candles, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
        
        # Simulation Loop
        for i in range(50, len(df)):
            # Slice data up to current point to simulate real-time
            current_slice = df.iloc[:i+1]
            current_candle = df.iloc[i]
            
            # Prepare market data for strategy
            market_data = {
                'candles': current_slice.values.tolist(),
                'ticker': {'last': current_candle['close']}
            }
            
            # Get Signal (Synchronous call for backtest)
            # Note: In real implementation, we might need to handle async properly
            # For now, we assume analyze is pure logic or we run it in a loop
            # Since analyze is async, we can't call it directly in sync loop easily without asyncio.run
            # But for backtesting performance, strategies should ideally separate logic from async IO.
            # For this MVP, we will assume we can run it.
            pass 

    async def run_async(self, candles: List[List[float]]):
        df = pd.DataFrame(candles, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
        
        for i in range(50, len(df)):
            current_slice = df.iloc[:i+1]
            current_candle = df.iloc[i]
            timestamp = current_candle['timestamp']
            price = current_candle['close']
            
            market_data = {
                'candles': current_slice.values.tolist(),
                'ticker': {'last': price}
            }
            
            signal = await self.strategy.analyze(market_data)
            
            # Execute Signal
            if signal['action'] == 'BUY' and self.position is None:
                # Buy Logic (All in for simplicity)
                size = self.capital / price
                self.position = {'entry_price': price, 'size': size, 'entry_time': timestamp}
                self.capital = 0
                self.trades.append({'type': 'BUY', 'price': price, 'time': timestamp, 'size': size})
                
            elif signal['action'] == 'SELL' and self.position is not None:
                # Sell Logic
                size = self.position['size']
                revenue = size * price
                pnl = revenue - (size * self.position['entry_price'])
                self.capital = revenue
                self.position = None
                self.trades.append({'type': 'SELL', 'price': price, 'time': timestamp, 'size': size, 'pnl': pnl})

            # Track Equity
            current_equity = self.capital
            if self.position:
                current_equity = self.position['size'] * price
            
            self.equity_curve.append({'time': timestamp, 'equity': current_equity})

        return self.generate_report()

    def generate_report(self) -> Dict[str, Any]:
        if not self.trades:
            return {'error': 'No trades executed'}

        df_equity = pd.DataFrame(self.equity_curve)
        total_return = ((df_equity['equity'].iloc[-1] - self.initial_capital) / self.initial_capital) * 100
        
        winning_trades = [t for t in self.trades if t.get('pnl', 0) > 0]
        win_rate = (len(winning_trades) / (len(self.trades) / 2)) * 100 if self.trades else 0

        # Calculate Max Drawdown
        df_equity['peak'] = df_equity['equity'].cummax()
        df_equity['drawdown'] = (df_equity['equity'] - df_equity['peak']) / df_equity['peak']
        max_drawdown = df_equity['drawdown'].min() * 100

        return {
            'initial_capital': self.initial_capital,
            'final_equity': df_equity['equity'].iloc[-1],
            'total_return_pct': total_return,
            'total_trades': len(self.trades) // 2,
            'win_rate_pct': win_rate,
            'max_drawdown_pct': max_drawdown,
            'trades': self.trades
        }
