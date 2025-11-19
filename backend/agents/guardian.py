"""
The Guardian Agent
Risk management agent for liquidation alerts, over-leverage detection, and funding rate monitoring.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional
from collections import defaultdict
import os


def get_supabase_client():
    """Lazy load Supabase client"""
    from supabase._sync.client import SyncClient
    return SyncClient.create(
        os.getenv('SUPABASE_URL', ''),
        os.getenv('SUPABASE_SERVICE_KEY', '')
    )


class GuardianAgent:
    """
    The Guardian: Risk management and protection agent
    
    Responsibilities:
    - Calculate liquidation prices for leveraged positions
    - Detect over-leverage based on risk profile
    - Monitor funding rates and alert on excessive costs
    - Generate risk alerts for users
    """
    
    def __init__(self):
        # Risk thresholds by user profile
        self.risk_profiles = {
            'conservative': {'max_leverage': 3, 'liquidation_buffer': 0.15},  # 15% buffer
            'moderate': {'max_leverage': 5, 'liquidation_buffer': 0.10},      # 10% buffer
            'aggressive': {'max_leverage': 10, 'liquidation_buffer': 0.05}    # 5% buffer
        }
        
        # Funding rate thresholds (annualized)
        self.high_funding_threshold = 0.001  # 0.1% per 8 hours = ~45% annualized
    
    def check_liquidation_risk(self, user_id: str) -> Dict:
        """
        Calculate liquidation prices and risk scores for all open positions.
        
        Returns:
            {
                "positions_at_risk": 2,
                "total_positions": 5,
                "high_risk_positions": [
                    {
                        "symbol": "BTC/USDT",
                        "entry_price": 40000,
                        "current_price": 39500,
                        "liquidation_price": 38500,
                        "distance_to_liquidation": "2.53%",
                        "risk_level": "high"
                    }
                ]
            }
        """
        positions = self._fetch_open_positions(user_id)
        
        if not positions:
            return self._empty_liquidation_result()
        
        risk_positions = []
        high_risk_count = 0
        
        for position in positions:
            # Calculate liquidation price
            liq_price = self._calculate_liquidation_price(position)
            
            if liq_price is None:
                continue
            
            # Get current price
            current_price = self._get_current_price(position['symbol'])
            
            if current_price is None:
                continue
            
            # Calculate distance to liquidation
            if position['side'] == 'long':
                distance = ((current_price - liq_price) / current_price) * 100
            else:
                distance = ((liq_price - current_price) / current_price) * 100
            
            # Determine risk level
            if distance < 5:
                risk_level = 'critical'
                high_risk_count += 1
            elif distance < 10:
                risk_level = 'high'
                high_risk_count += 1
            elif distance < 20:
                risk_level = 'medium'
            else:
                risk_level = 'low'
            
            risk_positions.append({
                'symbol': position['symbol'],
                'side': position['side'],
                'entry_price': float(position['entry_price']),
                'current_price': current_price,
                'liquidation_price': round(liq_price, 2),
                'distance_to_liquidation': f"{distance:.2f}%",
                'leverage': position.get('leverage', 1),
                'risk_level': risk_level
            })
        
        # Sort by risk (critical first)
        risk_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
        risk_positions.sort(key=lambda x: risk_order[x['risk_level']])
        
        return {
            'positions_at_risk': high_risk_count,
            'total_positions': len(positions),
            'high_risk_positions': risk_positions[:10],  # Top 10
            'status': 'alert' if high_risk_count > 0 else 'safe'
        }
    
    def detect_over_leverage(self, user_id: str, risk_profile: str = 'moderate') -> Dict:
        """
        Check if user is over-leveraged based on their risk profile.
        
        Returns:
            {
                "is_over_leveraged": true,
                "current_leverage": 8.5,
                "max_allowed_leverage": 5.0,
                "risk_profile": "moderate",
                "recommendation": "Reduce position size by 41%"
            }
        """
        profile = self.risk_profiles.get(risk_profile, self.risk_profiles['moderate'])
        max_leverage = profile['max_leverage']
        
        # Fetch user's portfolio
        portfolio = self._fetch_portfolio_balance(user_id)
        positions = self._fetch_open_positions(user_id)
        
        if not portfolio or not positions:
            return self._empty_leverage_result(risk_profile, max_leverage)
        
        total_balance = portfolio.get('total_balance', 0)
        
        if total_balance == 0:
            return self._empty_leverage_result(risk_profile, max_leverage)
        
        # Calculate total position value
        total_position_value = 0
        for position in positions:
            current_price = self._get_current_price(position['symbol'])
            if current_price:
                quantity = float(position.get('quantity', 0))
                total_position_value += quantity * current_price
        
        # Calculate effective leverage
        effective_leverage = total_position_value / total_balance if total_balance > 0 else 0
        
        is_over_leveraged = effective_leverage > max_leverage
        
        # Calculate reduction needed
        if is_over_leveraged:
            reduction_pct = ((effective_leverage - max_leverage) / effective_leverage) * 100
            recommendation = f"Reduce position size by {reduction_pct:.1f}%"
        else:
            headroom = max_leverage - effective_leverage
            recommendation = f"Safe. Can increase leverage by {headroom:.1f}x"
        
        return {
            'is_over_leveraged': is_over_leveraged,
            'current_leverage': round(effective_leverage, 2),
            'max_allowed_leverage': max_leverage,
            'risk_profile': risk_profile,
            'recommendation': recommendation,
            'status': 'warning' if is_over_leveraged else 'safe'
        }
    
    def monitor_funding_rates(self, user_id: str) -> Dict:
        """
        Monitor funding rates for open positions and alert on high costs.
        
        Returns:
            {
                "high_funding_positions": [
                    {
                        "symbol": "BTC/USDT",
                        "funding_rate": 0.0015,
                        "annualized_cost": "54.75%",
                        "daily_cost_usd": 125.50
                    }
                ],
                "total_daily_funding": 450.20,
                "recommendation": "Consider closing shorts on BTC/USDT"
            }
        """
        positions = self._fetch_open_positions(user_id)
        
        if not positions:
            return self._empty_funding_result()
        
        high_funding_positions = []
        total_daily_funding = 0
        
        for position in positions:
            # Get funding rate (mock - would fetch from exchange API)
            funding_rate = self._get_funding_rate(position['symbol'])
            
            if funding_rate is None:
                continue
            
            # Calculate annualized cost (funding paid 3 times per day)
            annualized_cost = funding_rate * 3 * 365 * 100  # Convert to percentage
            
            # Calculate daily cost in USD
            current_price = self._get_current_price(position['symbol'])
            if current_price:
                quantity = float(position.get('quantity', 0))
                position_value = quantity * current_price
                daily_cost = position_value * funding_rate * 3
                
                total_daily_funding += daily_cost
                
                # Flag if funding rate is high
                if abs(funding_rate) > self.high_funding_threshold:
                    high_funding_positions.append({
                        'symbol': position['symbol'],
                        'side': position['side'],
                        'funding_rate': round(funding_rate * 100, 4),  # As percentage
                        'annualized_cost': f"{abs(annualized_cost):.2f}%",
                        'daily_cost_usd': round(abs(daily_cost), 2),
                        'recommendation': self._get_funding_recommendation(position['side'], funding_rate)
                    })
        
        return {
            'high_funding_positions': high_funding_positions,
            'total_daily_funding': round(total_daily_funding, 2),
            'total_positions_monitored': len(positions),
            'status': 'alert' if high_funding_positions else 'normal',
            'overall_recommendation': self._get_overall_funding_recommendation(high_funding_positions)
        }
    
    # ========== Private Helper Methods ==========
    
    def _calculate_liquidation_price(self, position: Dict) -> Optional[float]:
        """
        Calculate liquidation price for a leveraged position.
        
        Formula (Long):
        Liquidation Price = Entry Price * (1 - 1/Leverage)
        
        Formula (Short):
        Liquidation Price = Entry Price * (1 + 1/Leverage)
        """
        try:
            entry_price = float(position.get('entry_price', 0))
            leverage = float(position.get('leverage', 1))
            side = position.get('side', '').lower()
            
            if entry_price == 0 or leverage == 0:
                return None
            
            if side == 'long':
                # Long liquidation = entry * (1 - 1/leverage)
                liq_price = entry_price * (1 - 1/leverage)
            else:
                # Short liquidation = entry * (1 + 1/leverage)
                liq_price = entry_price * (1 + 1/leverage)
            
            return liq_price
            
        except Exception:
            return None
    
    def _fetch_open_positions(self, user_id: str) -> List[Dict]:
        """Fetch user's open positions from database"""
        # TODO: Implement real position fetching
        # For now, return empty (positions would come from exchange API or DB)
        return []
    
    def _fetch_portfolio_balance(self, user_id: str) -> Dict:
        """Fetch user's portfolio balance"""
        try:
            supabase = get_supabase_client()
            result = supabase.table('portfolio_snapshots')\
                .select('*')\
                .eq('user_id', user_id)\
                .order('snapshot_at', desc=True)\
                .limit(1)\
                .execute()
            
            if result.data:
                return result.data[0]
            return {}
        except Exception:
            return {}
    
    def _get_current_price(self, symbol: str) -> Optional[float]:
        """Get current market price for symbol"""
        try:
            supabase = get_supabase_client()
            result = supabase.table('trade_history')\
                .select('price')\
                .eq('symbol', symbol)\
                .order('timestamp', desc=True)\
                .limit(1)\
                .execute()
            
            if result.data:
                return float(result.data[0]['price'])
            return None
        except Exception:
            return None
    
    def _get_funding_rate(self, symbol: str) -> Optional[float]:
        """Get current funding rate for symbol"""
        # TODO: Implement real funding rate fetching from exchange API
        # For now, return mock data
        import random
        return random.uniform(-0.0005, 0.0015)
    
    def _get_funding_recommendation(self, side: str, funding_rate: float) -> str:
        """Generate recommendation based on funding rate"""
        if funding_rate > self.high_funding_threshold:
            if side == 'short':
                return "High funding cost - consider closing short"
            else:
                return "Receiving high funding - favorable for longs"
        elif funding_rate < -self.high_funding_threshold:
            if side == 'long':
                return "High funding cost - consider closing long"
            else:
                return "Receiving high funding - favorable for shorts"
        return "Normal funding rate"
    
    def _get_overall_funding_recommendation(self, high_funding_positions: List[Dict]) -> str:
        """Generate overall funding recommendation"""
        if not high_funding_positions:
            return "Funding rates are normal across all positions"
        
        if len(high_funding_positions) > 3:
            return "Multiple positions with high funding costs - review portfolio"
        
        symbols = [p['symbol'] for p in high_funding_positions]
        return f"Monitor funding rates on: {', '.join(symbols)}"
    
    def _empty_liquidation_result(self) -> Dict:
        return {
            'positions_at_risk': 0,
            'total_positions': 0,
            'high_risk_positions': [],
            'status': 'no_data'
        }
    
    def _empty_leverage_result(self, risk_profile: str, max_leverage: float) -> Dict:
        return {
            'is_over_leveraged': False,
            'current_leverage': 0.0,
            'max_allowed_leverage': max_leverage,
            'risk_profile': risk_profile,
            'recommendation': 'No open positions',
            'status': 'no_data'
        }
    
    def _empty_funding_result(self) -> Dict:
        return {
            'high_funding_positions': [],
            'total_daily_funding': 0.0,
            'total_positions_monitored': 0,
            'status': 'no_data',
            'overall_recommendation': 'No open positions to monitor'
        }
