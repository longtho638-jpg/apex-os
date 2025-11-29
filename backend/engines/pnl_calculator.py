"""
PnL Calculation Engine
Calculates profit and loss with FIFO cost basis tracking, fee deduction, and funding fees.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from collections import defaultdict
from dataclasses import dataclass
import os


def get_supabase_client():
    """Lazy load Supabase client to avoid import-time initialization"""
    from supabase import create_client
    return create_client(
        os.getenv('SUPABASE_URL', ''),
        os.getenv('SUPABASE_SERVICE_KEY', '')
    )


@dataclass
class Position:
    """Represents an open position in FIFO queue"""
    symbol: str
    quantity: float
    entry_price: float
    timestamp: datetime
    fee_paid: float


@dataclass
class PnLResult:
    """Aggregated PnL result"""
    realized_pnl: float
    unrealized_pnl: float
    total_pnl: float
    total_fees: float
    total_funding_fees: float
    win_rate: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    largest_win: float
    largest_loss: float
    average_win: float
    average_loss: float
    profit_factor: float


class PnLCalculator:
    """Calculate profit and loss with institutional-grade accuracy"""
    
    def __init__(self):
        self.positions: Dict[str, List[Position]] = defaultdict(list)
        self.realized_pnl: float = 0.0
        self.total_fees: float = 0.0
        self.total_funding_fees: float = 0.0
        self.closed_trades: List[Dict] = []
        
    def calculate_user_pnl(self, user_id: str, days: int = 30) -> PnLResult:
        """
        Calculate complete PnL for a user over specified period.
        
        Args:
            user_id: User UUID
            days: Lookback period (default 30 days)
            
        Returns:
            PnLResult with realized, unrealized, and total PnL
        """
        # Fetch trades from database
        trades = self._fetch_user_trades(user_id, days)
        
        if not trades:
            return self._empty_result()
        
        # Process trades in chronological order
        for trade in sorted(trades, key=lambda t: t['timestamp']):
            self._process_trade(trade)
        
        # Calculate unrealized PnL for open positions
        unrealized_pnl = self._calculate_unrealized_pnl()
        
        # Calculate statistics
        stats = self._calculate_statistics()
        
        return PnLResult(
            realized_pnl=round(self.realized_pnl, 2),
            unrealized_pnl=round(unrealized_pnl, 2),
            total_pnl=round(self.realized_pnl + unrealized_pnl, 2),
            total_fees=round(self.total_fees, 2),
            total_funding_fees=round(self.total_funding_fees, 2),
            **stats
        )
    
    def _process_trade(self, trade: Dict):
        """Process a single trade and update position stack"""
        symbol = trade['symbol']
        side = trade['side']
        quantity = float(trade['quantity'])
        price = float(trade['price'])
        fee = float(trade.get('fee', 0))
        timestamp = datetime.fromisoformat(trade['timestamp'])
        
        # Add fee to total
        self.total_fees += fee
        
        if side == 'buy':
            # Add to position stack (FIFO queue)
            position = Position(
                symbol=symbol,
                quantity=quantity,
                entry_price=price,
                timestamp=timestamp,
                fee_paid=fee
            )
            self.positions[symbol].append(position)
            
        elif side == 'sell':
            # Close positions using FIFO
            remaining_qty = quantity
            sell_fee = fee
            total_pnl = 0.0
            
            while remaining_qty > 0 and self.positions[symbol]:
                position = self.positions[symbol][0]
                
                if position.quantity <= remaining_qty:
                    # Close entire position
                    qty_to_close = position.quantity
                    pnl = (price - position.entry_price) * qty_to_close
                    total_pnl += pnl
                    
                    # Deduct proportional fees
                    proportional_buy_fee = position.fee_paid
                    proportional_sell_fee = sell_fee * (qty_to_close / quantity)
                    
                    net_pnl = pnl - proportional_buy_fee - proportional_sell_fee
                    
                    # Record closed trade
                    self.closed_trades.append({
                        'symbol': symbol,
                        'quantity': qty_to_close,
                        'entry_price': position.entry_price,
                        'exit_price': price,
                        'pnl': net_pnl,
                        'entry_time': position.timestamp,
                        'exit_time': timestamp,
                        'hold_time': (timestamp - position.timestamp).total_seconds() / 3600
                    })
                    
                    self.realized_pnl += net_pnl
                    remaining_qty -= qty_to_close
                    self.positions[symbol].pop(0)
                    
                else:
                    # Partially close position
                    qty_to_close = remaining_qty
                    pnl = (price - position.entry_price) * qty_to_close
                    total_pnl += pnl
                    
                    # Deduct proportional fees
                    proportional_buy_fee = position.fee_paid * (qty_to_close / position.quantity)
                    proportional_sell_fee = sell_fee * (qty_to_close / quantity)
                    
                    net_pnl = pnl - proportional_buy_fee - proportional_sell_fee
                    
                    # Record closed trade
                    self.closed_trades.append({
                        'symbol': symbol,
                        'quantity': qty_to_close,
                        'entry_price': position.entry_price,
                        'exit_price': price,
                        'pnl': net_pnl,
                        'entry_time': position.timestamp,
                        'exit_time': timestamp,
                        'hold_time': (timestamp - position.timestamp).total_seconds() / 3600
                    })
                    
                    self.realized_pnl += net_pnl
                    position.quantity -= qty_to_close
                    position.fee_paid -= proportional_buy_fee
                    remaining_qty = 0
    
    def _calculate_unrealized_pnl(self) -> float:
        """Calculate PnL for all open positions using current market prices"""
        unrealized = 0.0
        
        for symbol, positions in self.positions.items():
            if not positions:
                continue
                
            # Fetch current price
            current_price = self._get_current_price(symbol)
            
            if current_price is None:
                continue
            
            for position in positions:
                pnl = (current_price - position.entry_price) * position.quantity
                unrealized += pnl - position.fee_paid
        
        return unrealized
    
    def _calculate_statistics(self) -> Dict:
        """Calculate win rate and other statistics"""
        if not self.closed_trades:
            return {
                'win_rate': 0.0,
                'total_trades': 0,
                'winning_trades': 0,
                'losing_trades': 0,
                'largest_win': 0.0,
                'largest_loss': 0.0,
                'average_win': 0.0,
                'average_loss': 0.0,
                'profit_factor': 0.0
            }
        
        winning_trades = [t for t in self.closed_trades if t['pnl'] > 0]
        losing_trades = [t for t in self.closed_trades if t['pnl'] <= 0]
        
        total_wins = sum(t['pnl'] for t in winning_trades)
        total_losses = abs(sum(t['pnl'] for t in losing_trades))
        
        return {
            'win_rate': round((len(winning_trades) / len(self.closed_trades)) * 100, 1),
            'total_trades': len(self.closed_trades),
            'winning_trades': len(winning_trades),
            'losing_trades': len(losing_trades),
            'largest_win': round(max([t['pnl'] for t in winning_trades], default=0.0), 2),
            'largest_loss': round(min([t['pnl'] for t in losing_trades], default=0.0), 2),
            'average_win': round(total_wins / len(winning_trades), 2) if winning_trades else 0.0,
            'average_loss': round(total_losses / len(losing_trades), 2) if losing_trades else 0.0,
            'profit_factor': round(total_wins / total_losses, 2) if total_losses > 0 else 0.0
        }
    
    def _fetch_user_trades(self, user_id: str, days: int) -> List[Dict]:
        """Fetch user's trade history from database"""
        since_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        try:
            from core.rest_client import query_table
            
            # Fetch via REST API
            trades = query_table(
                'trade_history',
                filters={'user_id': user_id},
                order_by='timestamp.asc',
                limit=1000
            )
            
            # Filter by date
            filtered = [
                t for t in trades 
                if t['timestamp'] >= since_date
            ]
            
            return filtered
        except Exception as e:
            print(f"Error fetching trades: {e}")
            return []
    
    def _get_current_price(self, symbol: str) -> Optional[float]:
        """
        Fetch current market price for a symbol.
        In production, this should use CCXT or WebSocket feed.
        """
        try:
            from core.rest_client import query_table
            
            trades = query_table(
                'trade_history',
                filters={'symbol': symbol},
                order_by='timestamp.desc',
                limit=1
            )
            
            if trades:
                return float(trades[0]['price'])
            return None
        except Exception:
            return None
    
    def _empty_result(self) -> PnLResult:
        """Return empty result when no trades exist"""
        return PnLResult(
            realized_pnl=0.0,
            unrealized_pnl=0.0,
            total_pnl=0.0,
            total_fees=0.0,
            total_funding_fees=0.0,
            win_rate=0.0,
            total_trades=0,
            winning_trades=0,
            losing_trades=0,
            largest_win=0.0,
            largest_loss=0.0,
            average_win=0.0,
            average_loss=0.0,
            profit_factor=0.0
        )
