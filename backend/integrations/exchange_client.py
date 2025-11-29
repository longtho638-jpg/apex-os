"""
CCXT Exchange Integration
Connect to Binance, Bybit, OKX and fetch real trade data
"""

import ccxt
from typing import Optional, List, Dict
from datetime import datetime, timedelta
import os


class ExchangeClient:
    """
    Unified interface for multiple exchanges using CCXT
    """
    
    SUPPORTED_EXCHANGES = ['binance', 'bybit', 'okx']
    
    def __init__(self, exchange_name: str, api_key: str, api_secret: str):
        """
        Initialize exchange client
        
        Args:
            exchange_name: 'binance', 'bybit', or 'okx'
            api_key: Exchange API key
            api_secret: Exchange API secret
        """
        if exchange_name.lower() not in self.SUPPORTED_EXCHANGES:
            raise ValueError(f"Unsupported exchange: {exchange_name}")
        
        self.exchange_name = exchange_name.lower()
        self.exchange = self._create_exchange(api_key, api_secret)
    
    def _create_exchange(self, api_key: str, api_secret: str):
        """Create CCXT exchange instance"""
        exchange_class = getattr(ccxt, self.exchange_name)
        
        return exchange_class({
            'apiKey': api_key,
            'secret': api_secret,
            'enableRateLimit': True,
            'options': {
                'defaultType': 'future',  # For futures trading
            }
        })
    
    def test_connection(self) -> Dict:
        """
        Test if API credentials are valid
        
        Returns:
            {
                "success": True/False,
                "message": "Connection successful",
                "permissions": ["read", "trade"],  # API permissions
                "balance": 10000.00  # Account balance
            }
        """
        try:
            # Fetch balance to test connection
            balance = self.exchange.fetch_balance()
            
            # Check if we have read access
            total_balance = balance.get('total', {})
            
            return {
                'success': True,
                'message': 'Connection successful',
                'permissions': self._detect_permissions(),
                'balance': sum(total_balance.values()) if total_balance else 0.0,
                'exchange': self.exchange_name
            }
            
        except ccxt.AuthenticationError as e:
            return {
                'success': False,
                'message': f'Authentication failed: {str(e)}',
                'permissions': [],
                'balance': 0.0
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'Connection error: {str(e)}',
                'permissions': [],
                'balance': 0.0
            }
    
    def _detect_permissions(self) -> List[str]:
        """Detect what permissions the API key has"""
        permissions = []
        
        try:
            # Try read operation
            self.exchange.fetch_balance()
            permissions.append('read')
        except:
            pass
        
        # We don't test trade permission (dangerous)
        # Just note in docs that we only need READ
        
        return permissions
    
    def fetch_trades(self, symbol: str = 'BTC/USDT', since: Optional[datetime] = None, limit: int = 100) -> List[Dict]:
        """
        Fetch user's trade history
        
        Args:
            symbol: Trading pair (e.g., 'BTC/USDT')
            since: Fetch trades from this date onwards
            limit: Max number of trades to fetch
        
        Returns:
            List of trades in standardized format
        """
        try:
            # Convert datetime to timestamp
            since_ms = None
            if since:
                since_ms = int(since.timestamp() * 1000)
            
            # Fetch trades from exchange
            trades = self.exchange.fetch_my_trades(symbol=symbol, since=since_ms, limit=limit)
            
            # Normalize to our format
            normalized = []
            for trade in trades:
                normalized.append({
                    'exchange': self.exchange_name,
                    'symbol': trade['symbol'],
                    'trade_id': trade['id'],
                    'side': trade['side'],  # 'buy' or 'sell'
                    'price': float(trade['price']),
                    'quantity': float(trade['amount']),
                    'quote_quantity': float(trade['cost']),
                    'fee': float(trade.get('fee', {}).get('cost', 0)),
                    'fee_currency': trade.get('fee', {}).get('currency', 'USDT'),
                    'timestamp': datetime.fromtimestamp(trade['timestamp'] / 1000).isoformat(),
                    'maker_or_taker': trade.get('takerOrMaker', 'taker')
                })
            
            return normalized
            
        except Exception as e:
            print(f"Error fetching trades: {e}")
            return []
    
    def fetch_all_symbols_trades(self, since: Optional[datetime] = None, limit_per_symbol: int = 100) -> List[Dict]:
        """
        Fetch trades for all symbols (useful for initial sync)
        
        Args:
            since: Fetch trades from this date
            limit_per_symbol: Max trades per symbol
        
        Returns:
            List of all trades across all symbols
        """
        all_trades = []
        
        try:
            # Get user's open positions to know which symbols to sync
            markets = self.exchange.fetch_markets()
            active_symbols = [m['symbol'] for m in markets if m.get('active', False)][:10]  # Limit to top 10
            
            for symbol in active_symbols:
                try:
                    trades = self.fetch_trades(symbol=symbol, since=since, limit=limit_per_symbol)
                    all_trades.extend(trades)
                except:
                    # Skip symbols with errors
                    continue
            
            return all_trades
            
        except Exception as e:
            print(f"Error fetching all trades: {e}")
            return []
    
    def get_current_price(self, symbol: str = 'BTC/USDT') -> Optional[float]:
        """
        Get current market price for a symbol
        
        Args:
            symbol: Trading pair
        
        Returns:
            Current price or None
        """
        try:
            ticker = self.exchange.fetch_ticker(symbol)
            return float(ticker['last'])
        except:
            return None


# Convenience function
def create_exchange_client(exchange_name: str, api_key: str, api_secret: str) -> ExchangeClient:
    """Factory function to create exchange client"""
    return ExchangeClient(exchange_name, api_key, api_secret)
