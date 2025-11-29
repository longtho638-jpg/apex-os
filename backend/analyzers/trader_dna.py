"""
Trader DNA Analyzer
Analyzes trade history to determine trading style (Ngũ Hành classification).
"""

from datetime import datetime, timedelta
from typing import Dict, List, Tuple
from collections import defaultdict
import statistics
from supabase import create_client, Client
import os

supabase: Client = create_client(
    os.getenv('SUPABASE_URL', ''),
    os.getenv('SUPABASE_SERVICE_KEY', '')
)

class TraderDNAAnalyzer:
    """Analyze trading patterns to generate Trader DNA profile"""
    
    def __init__(self):
        self.element_weights = {
            'FIRE': 0,
            'WATER': 0,
            'EARTH': 0,
            'METAL': 0,
            'WOOD': 0
        }
    
    def analyze(self, user_id: str) -> Dict:
        """
        Generate complete Trader DNA profile from trade history.
        
        Returns:
            {
                "primaryElement": "FIRE",
                "elementScores": {"FIRE": 85, ...},
                "alphaWindow": {"start": "09:30", "end": "11:00"},
                "nemesis": "SOL/USDT",
                "winRate": 62.5
            }
        """
        # Fetch trade history (last 30 days)
        trades = self._get_user_trades(user_id, days=30)
        
        if not trades or len(trades) < 10:
            # Not enough data, return defaults
            return self._get_default_profile()
        
        # Calculate element scores
        element_scores = self._calculate_element_scores(trades)
        
        # Determine primary element
        primary_element = max(element_scores, key=element_scores.get)
        
        # Detect alpha window
        alpha_window = self._detect_alpha_window(trades)
        
        # Find nemesis pair
        nemesis = self._find_nemesis_pair(trades)
        
        # Calculate win rate
        win_rate = self._calculate_win_rate(trades)
        
        return {
            "primaryElement": primary_element,
            "elementScores": element_scores,
            "alphaWindow": alpha_window,
            "nemesis": nemesis,
            "winRate": win_rate
        }
    
    def _get_user_trades(self, user_id: str, days: int = 30) -> List[Dict]:
        """Fetch user's trade history from database"""
        since_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        try:
            result = supabase.table('trade_history')\
                .select('*')\
                .eq('user_id', user_id)\
                .gte('timestamp', since_date)\
                .order('timestamp', desc=False)\
                .execute()
            
            return result.data if result.data else []
        except Exception as e:
            print(f"Error fetching trades: {e}")
            return []
    
    def _calculate_element_scores(self, trades: List[Dict]) -> Dict[str, int]:
        """
        Calculate affinity score for each element based on trading behavior.
        
        Elements:
        - FIRE: High frequency, short holds, aggressive
        - WATER: Medium frequency, swing trades, adaptive
        - EARTH: Low frequency, long holds, patient
        - METAL: Consistent patterns, algorithmic-like
        - WOOD: Growth-focused, holds winners
        """
        scores = {
            'FIRE': 0,
            'WATER': 0,
            'EARTH': 0,
            'METAL': 0,
            'WOOD': 0
        }
        
        if len(trades) < 2:
            return scores
        
        # 1. Trading Frequency Analysis
        days_active = (
            datetime.fromisoformat(trades[-1]['timestamp']) - 
            datetime.fromisoformat(trades[0]['timestamp'])
        ).days or 1
        
        trades_per_day = len(trades) / days_active
        
        if trades_per_day > 20:
            scores['FIRE'] += 40  # High frequency scalper
        elif trades_per_day > 5:
            scores['WATER'] += 30  # Active trader
        elif trades_per_day < 1:
            scores['EARTH'] += 35  # Patient holder
        
        # 2. Hold Duration Analysis
        hold_times = self._calculate_hold_times(trades)
        
        if hold_times:
            avg_hold_hours = statistics.mean(hold_times)
            
            if avg_hold_hours < 1:
                scores['FIRE'] += 30  # Scalping
            elif avg_hold_hours < 24:
                scores['WATER'] += 25  # Swing trading
            elif avg_hold_hours > 168:  # 7 days
                scores['EARTH'] += 30  # Position trading
        
        # 3. Consistency Analysis (for METAL - algorithmic)
        trade_intervals = self._calculate_trade_intervals(trades)
        
        if trade_intervals:
            interval_std = statistics.stdev(trade_intervals) if len(trade_intervals) > 1 else 0
            avg_interval = statistics.mean(trade_intervals)
            
            # Low variance = high consistency = algorithmic
            if interval_std < avg_interval * 0.3:
                scores['METAL'] += 35
        
        # 4. Profit Pattern Analysis (for WOOD - growth)
        profit_trades = [t for t in trades if self._is_profitable_trade(t, trades)]
        
        if profit_trades:
            profit_ratio = len(profit_trades) / len(trades)
            
            if profit_ratio > 0.6:
                scores['WOOD'] += 25  # Grows portfolio
        
        # 5. Risk Analysis
        large_positions = [t for t in trades if float(t['quote_quantity']) > 1000]
        
        if len(large_positions) > len(trades) * 0.3:
            scores['FIRE'] += 15  # Aggressive sizing
            scores['EARTH'] -= 10
        
        # Normalize to 0-100
        total = sum(scores.values()) or 1
        normalized = {k: int((v / total) * 100) for k, v in scores.items()}
        
        return normalized
    
    def _calculate_hold_times(self, trades: List[Dict]) -> List[float]:
        """Calculate hold duration for each position (in hours)"""
        hold_times = []
        positions = defaultdict(list)
        
        # Group trades by symbol
        for trade in trades:
            positions[trade['symbol']].append(trade)
        
        # For each symbol, match buys with sells
        for symbol, symbol_trades in positions.items():
            position_qty = 0
            entry_time = None
            
            for trade in sorted(symbol_trades, key=lambda x: x['timestamp']):
                qty = float(trade['quantity'])
                
                if trade['side'] == 'buy':
                    if position_qty == 0:
                        entry_time = datetime.fromisoformat(trade['timestamp'])
                    position_qty += qty
                else:  # sell
                    if position_qty > 0 and entry_time:
                        exit_time = datetime.fromisoformat(trade['timestamp'])
                        hold_duration = (exit_time - entry_time).total_seconds() / 3600
                        hold_times.append(hold_duration)
                    
                    position_qty -= qty
                    if position_qty <= 0:
                        position_qty = 0
                        entry_time = None
        
        return hold_times
    
    def _calculate_trade_intervals(self, trades: List[Dict]) -> List[float]:
        """Calculate time between consecutive trades (in minutes)"""
        intervals = []
        
        for i in range(1, len(trades)):
            t1 = datetime.fromisoformat(trades[i-1]['timestamp'])
            t2 = datetime.fromisoformat(trades[i]['timestamp'])
            interval = (t2 - t1).total_seconds() / 60
            intervals.append(interval)
        
        return intervals
    
    def _is_profitable_trade(self, sell_trade: Dict, all_trades: List[Dict]) -> bool:
        """Check if a sell trade was profitable"""
        if sell_trade['side'] != 'sell':
            return False
        
        symbol = sell_trade['symbol']
        sell_time = datetime.fromisoformat(sell_trade['timestamp'])
        sell_price = float(sell_trade['price'])
        
        # Find corresponding buy before this sell
        for trade in reversed(all_trades):
            if trade['symbol'] == symbol and trade['side'] == 'buy':
                trade_time = datetime.fromisoformat(trade['timestamp'])
                if trade_time < sell_time:
                    buy_price = float(trade['price'])
                    return sell_price > buy_price
        
        return False
    
    def _detect_alpha_window(self, trades: List[Dict]) -> Dict[str, str]:
        """Find 2-hour window with highest average profit"""
        hourly_pnl = defaultdict(list)
        
        # Calculate PnL by hour
        for i, trade in enumerate(trades):
            if trade['side'] == 'sell':
                # Find matching buy
                profit = self._calculate_trade_pnl(trade, trades[:i])
                
                if profit is not None:
                    hour = datetime.fromisoformat(trade['timestamp']).hour
                    hourly_pnl[hour].append(profit)
        
        if not hourly_pnl:
            return {"start": "09:00", "end": "11:00"}
        
        # Find best 2-hour consecutive window
        best_window = (0, 0)
        best_pnl = float('-inf')
        
        for start_hour in range(24):
            end_hour = (start_hour + 2) % 24
            window_pnl = (
                sum(hourly_pnl.get(start_hour, [0])) + 
                sum(hourly_pnl.get((start_hour + 1) % 24, [0]))
            )
            
            if window_pnl > best_pnl:
                best_pnl = window_pnl
                best_window = (start_hour, end_hour)
        
        return {
            "start": f"{best_window[0]:02d}:00",
            "end": f"{best_window[1]:02d}:00"
        }
    
    def _calculate_trade_pnl(self, sell_trade: Dict, prior_trades: List[Dict]) -> float:
        """Calculate PnL for a sell trade"""
        symbol = sell_trade['symbol']
        sell_price = float(sell_trade['price'])
        sell_qty = float(sell_trade['quantity'])
        
        for trade in reversed(prior_trades):
            if trade['symbol'] == symbol and trade['side'] == 'buy':
                buy_price = float(trade['price'])
                pnl = (sell_price - buy_price) * sell_qty
                return pnl
        
        return None
    
    def _find_nemesis_pair(self, trades: List[Dict]) -> str:
        """Find trading pair with worst performance"""
        pair_pnl = defaultdict(float)
        
        for i, trade in enumerate(trades):
            if trade['side'] == 'sell':
                pnl = self._calculate_trade_pnl(trade, trades[:i])
                if pnl is not None:
                    pair_pnl[trade['symbol']] += pnl
        
        if not pair_pnl:
            return "UNKNOWN"
        
        # Return pair with most negative PnL
        nemesis = min(pair_pnl, key=pair_pnl.get)
        return nemesis.replace('/', '/USDT') if '/' not in nemesis else nemesis
    
    def _calculate_win_rate(self, trades: List[Dict]) -> float:
        """Calculate overall win rate percentage"""
        winning_trades = 0
        total_closed_trades = 0
        
        for i, trade in enumerate(trades):
            if trade['side'] == 'sell':
                pnl = self._calculate_trade_pnl(trade, trades[:i])
                if pnl is not None:
                    total_closed_trades += 1
                    if pnl > 0:
                        winning_trades += 1
        
        if total_closed_trades == 0:
            return 50.0
        
        return round((winning_trades / total_closed_trades) * 100, 1)
    
    def _get_default_profile(self) -> Dict:
        """Return default profile when insufficient data"""
        return {
            "primaryElement": "WATER",
            "elementScores": {
                "FIRE": 20,
                "WATER": 30,
                "EARTH": 20,
                "METAL": 15,
                "WOOD": 15
            },
            "alphaWindow": {"start": "09:00", "end": "11:00"},
            "nemesis": "UNKNOWN",
            "winRate": 50.0
        }
