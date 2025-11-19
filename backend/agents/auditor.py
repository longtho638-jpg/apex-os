"""
The Auditor Agent
Governance agent responsible for fee reconciliation, rebate calculation, and tax reporting.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional
from collections import defaultdict
import os


def get_supabase_client():
    """Lazy load Supabase client"""
    from supabase import create_client
    return create_client(
        os.getenv('SUPABASE_URL', ''),
        os.getenv('SUPABASE_SERVICE_KEY', '')
    )


class AuditorAgent:
    """
    The Auditor: Governance agent for fee transparency and rebate calculations
    
    Responsibilities:
    - Fee reconciliation (compare expected vs actual fees)
    - Rebate calculation (commission splits)
    - Tax report generation
    """
    
    def __init__(self):
        # Standard maker/taker fee rates by exchange
        # TODO: Fetch from exchange_configs table
        self.fee_rates = {
            'binance': {'maker': 0.001, 'taker': 0.001},  # 0.1%
            'bybit': {'maker': 0.0001, 'taker': 0.0006},   # 0.01% / 0.06%
            'okx': {'maker': 0.0008, 'taker': 0.001},      # 0.08% / 0.1%
        }
        
        # Commission split configuration
        # Apex keeps 10-20%, returns 80-90% to user
        self.commission_retention_rate = 0.15  # 15% retention
    
    def reconcile_fees(self, user_id: str, days: int = 30) -> Dict:
        """
        Compare expected fees vs actual fees charged by exchange.
        
        Returns:
            {
                "total_expected_fees": 125.50,
                "total_actual_fees": 130.20,
                "discrepancy": 4.70,
                "discrepancy_percent": 3.74,
                "flagged_trades": [...]
            }
        """
        trades = self._fetch_user_trades(user_id, days)
        
        if not trades:
            return self._empty_reconciliation()
        
        total_expected = 0.0
        total_actual = 0.0
        flagged_trades = []
        
        for trade in trades:
            expected_fee = self._calculate_expected_fee(trade)
            actual_fee = float(trade.get('fee', 0))
            
            total_expected += expected_fee
            total_actual += actual_fee
            
            # Flag if discrepancy > 5%
            if abs(actual_fee - expected_fee) / expected_fee > 0.05:
                flagged_trades.append({
                    'trade_id': trade['id'],
                    'symbol': trade['symbol'],
                    'expected_fee': round(expected_fee, 4),
                    'actual_fee': round(actual_fee, 4),
                    'discrepancy': round(actual_fee - expected_fee, 4),
                    'timestamp': trade['timestamp']
                })
        
        discrepancy = total_actual - total_expected
        discrepancy_percent = (discrepancy / total_expected * 100) if total_expected > 0 else 0
        
        return {
            'total_expected_fees': round(total_expected, 2),
            'total_actual_fees': round(total_actual, 2),
            'discrepancy': round(discrepancy, 2),
            'discrepancy_percent': round(discrepancy_percent, 2),
            'flagged_trades_count': len(flagged_trades),
            'flagged_trades': flagged_trades[:10],  # Limit to 10 for brevity
            'status': 'alert' if abs(discrepancy_percent) > 5 else 'normal'
        }
    
    def calculate_rebates(self, user_id: str, days: int = 30) -> Dict:
        """
        Calculate user's rebate based on commission splits.
        
        Logic:
        1. Get total fees user paid to exchange
        2. Estimate commission Apex receives from exchange (e.g., 20% of fees)
        3. Calculate user's rebate (80-90% of commission)
        
        Returns:
            {
                "total_fees_paid": 1000.00,
                "estimated_commission": 200.00,  # Exchange gives Apex 20%
                "user_rebate": 170.00,           # User gets 85% of commission
                "apex_profit": 30.00              # Apex keeps 15%
            }
        """
        trades = self._fetch_user_trades(user_id, days)
        
        if not trades:
            return self._empty_rebate()
        
        total_fees_paid = sum(float(t.get('fee', 0)) for t in trades)
        
        # Assumption: Exchange gives Apex 20% commission on fees
        exchange_commission_rate = 0.20
        estimated_commission = total_fees_paid * exchange_commission_rate
        
        # Apex keeps 15%, returns 85% to user
        user_rebate = estimated_commission * (1 - self.commission_retention_rate)
        apex_profit = estimated_commission * self.commission_retention_rate
        
        # Store rebate in database
        self._store_rebate(user_id, user_rebate, days)
        
        return {
            'total_fees_paid': round(total_fees_paid, 2),
            'estimated_commission': round(estimated_commission, 2),
            'user_rebate': round(user_rebate, 2),
            'apex_profit': round(apex_profit, 2),
            'rebate_percentage': round((user_rebate / total_fees_paid) * 100, 2),
            'period_days': days
        }
    
    def generate_tax_report(self, user_id: str, year: int = 2024) -> Dict:
        """
        Generate tax report for a calendar year.
        
        Returns:
            {
                "year": 2024,
                "total_realized_pnl": 15250.50,
                "total_fees": 450.20,
                "net_taxable_income": 14800.30,
                "trades_count": 342,
                "csv_data": "..."  # CSV string for download
            }
        """
        # Fetch all trades for the year
        start_date = f"{year}-01-01T00:00:00"
        end_date = f"{year}-12-31T23:59:59"
        
        trades = self._fetch_trades_by_date_range(user_id, start_date, end_date)
        
        if not trades:
            return self._empty_tax_report(year)
        
        # Calculate realized PnL using PnL engine
        from engines.pnl_calculator import PnLCalculator
        calculator = PnLCalculator()
        
        # Process all trades
        for trade in sorted(trades, key=lambda t: t['timestamp']):
            calculator._process_trade(trade)
        
        realized_pnl = calculator.realized_pnl
        total_fees = calculator.total_fees
        net_taxable_income = realized_pnl - total_fees
        
        # Generate CSV
        csv_data = self._generate_tax_csv(trades, realized_pnl, total_fees)
        
        return {
            'year': year,
            'total_realized_pnl': round(realized_pnl, 2),
            'total_fees': round(total_fees, 2),
            'net_taxable_income': round(net_taxable_income, 2),
            'trades_count': len(trades),
            'winning_trades': len(calculator.closed_trades) if calculator.closed_trades else 0,
            'csv_data': csv_data
        }
    
    # ========== Private Helper Methods ==========
    
    def _calculate_expected_fee(self, trade: Dict) -> float:
        """Calculate expected fee based on standard rates"""
        exchange = trade.get('exchange', 'binance').lower()
        side_type = trade.get('maker_or_taker', 'taker')  # Default to taker
        
        fee_rate = self.fee_rates.get(exchange, {}).get(side_type, 0.001)
        quantity = float(trade.get('quote_quantity', 0))
        
        return quantity * fee_rate
    
    def _fetch_user_trades(self, user_id: str, days: int) -> List[Dict]:
        """Fetch trades for specified period"""
        since_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        try:
            supabase = get_supabase_client()
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
    
    def _fetch_trades_by_date_range(self, user_id: str, start_date: str, end_date: str) -> List[Dict]:
        """Fetch trades for specific date range"""
        try:
            supabase = get_supabase_client()
            result = supabase.table('trade_history')\
                .select('*')\
                .eq('user_id', user_id)\
                .gte('timestamp', start_date)\
                .lte('timestamp', end_date)\
                .order('timestamp', desc=False)\
                .execute()
            
            return result.data if result.data else []
        except Exception as e:
            print(f"Error fetching trades: {e}")
            return []
    
    def _store_rebate(self, user_id: str, rebate_amount: float, period_days: int):
        """Store rebate record in database"""
        try:
            supabase = get_supabase_client()
            supabase.table('rebate_history').insert({
                'user_id': user_id,
                'rebate_amount': rebate_amount,
                'period_days': period_days,
                'calculated_at': datetime.now().isoformat(),
                'status': 'pending'
            }).execute()
        except Exception as e:
            print(f"Error storing rebate: {e}")
    
    def _generate_tax_csv(self, trades: List[Dict], realized_pnl: float, total_fees: float) -> str:
        """Generate CSV for tax reporting"""
        csv_lines = [
            "Date,Symbol,Side,Quantity,Price,Fee,PnL",
        ]
        
        for trade in trades:
            csv_lines.append(
                f"{trade['timestamp']},{trade['symbol']},{trade['side']},"
                f"{trade['quantity']},{trade['price']},{trade.get('fee', 0)},0"
            )
        
        csv_lines.append(f"\nTotal Realized PnL,{realized_pnl}")
        csv_lines.append(f"Total Fees,{total_fees}")
        csv_lines.append(f"Net Taxable Income,{realized_pnl - total_fees}")
        
        return "\n".join(csv_lines)
    
    def _empty_reconciliation(self) -> Dict:
        return {
            'total_expected_fees': 0.0,
            'total_actual_fees': 0.0,
            'discrepancy': 0.0,
            'discrepancy_percent': 0.0,
            'flagged_trades_count': 0,
            'flagged_trades': [],
            'status': 'no_data'
        }
    
    def _empty_rebate(self) -> Dict:
        return {
            'total_fees_paid': 0.0,
            'estimated_commission': 0.0,
            'user_rebate': 0.0,
            'apex_profit': 0.0,
            'rebate_percentage': 0.0,
            'period_days': 0
        }
    
    def _empty_tax_report(self, year: int) -> Dict:
        return {
            'year': year,
            'total_realized_pnl': 0.0,
            'total_fees': 0.0,
            'net_taxable_income': 0.0,
            'trades_count': 0,
            'winning_trades': 0,
            'csv_data': ''
        }
