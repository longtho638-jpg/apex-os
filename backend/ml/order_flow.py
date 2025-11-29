import requests
import pandas as pd
import time
from datetime import datetime

class OrderFlowAnalyzer:
    """
    Analyzes Binance Order Book for Imbalance and Whale Activity
    """
    
    def __init__(self):
        self.base_url = "https://api.binance.com/api/v3"
        self._cache = {}
        self._cache_ttl = 60 # seconds

    def _get_order_book(self, symbol: str, limit: int = 100):
        """Fetch order book with caching"""
        now = time.time()
        cache_key = f"{symbol}_{limit}"
        
        if cache_key in self._cache:
            data, timestamp = self._cache[cache_key]
            if now - timestamp < self._cache_ttl:
                return data
        
        try:
            url = f"{self.base_url}/depth"
            params = {"symbol": symbol.replace('/', ''), "limit": limit}
            response = requests.get(url, params=params, timeout=5)
            response.raise_for_status()
            data = response.json()
            
            self._cache[cache_key] = (data, now)
            return data
        except Exception as e:
            print(f"Error fetching order book for {symbol}: {e}")
            return None

    def get_order_book_imbalance(self, symbol: str, depth: int = 20) -> float:
        """
        Calculate Order Book Imbalance (OBI)
        Ratio of Bid Vol / (Bid Vol + Ask Vol)
        > 0.5 means Buy Pressure
        """
        data = self._get_order_book(symbol, limit=depth)
        if not data:
            return 0.5
            
        bids = pd.DataFrame(data['bids'], columns=['price', 'qty'], dtype=float)
        asks = pd.DataFrame(data['asks'], columns=['price', 'qty'], dtype=float)
        
        total_bid_vol = (bids['price'] * bids['qty']).sum()
        total_ask_vol = (asks['price'] * asks['qty']).sum()
        
        if total_bid_vol + total_ask_vol == 0:
            return 0.5
            
        imbalance = total_bid_vol / (total_bid_vol + total_ask_vol)
        return imbalance

    def calculate_bid_ask_spread(self, symbol: str) -> float:
        """Calculate percentage spread"""
        data = self._get_order_book(symbol, limit=5)
        if not data:
            return 0.0
            
        best_bid = float(data['bids'][0][0])
        best_ask = float(data['asks'][0][0])
        
        if best_ask == 0:
            return 0.0
            
        spread_pct = ((best_ask - best_bid) / best_ask) * 100
        return spread_pct

    def detect_large_orders(self, symbol: str, threshold_usd: float = 100000) -> list:
        """Detect whale walls in order book"""
        data = self._get_order_book(symbol, limit=100)
        if not data:
            return []
            
        large_orders = []
        
        # Check Bids (Buy Walls)
        for price, qty in data['bids']:
            price, qty = float(price), float(qty)
            value = price * qty
            if value >= threshold_usd:
                large_orders.append({
                    "side": "BID",
                    "price": price,
                    "qty": qty,
                    "value_usd": value
                })
                
        # Check Asks (Sell Walls)
        for price, qty in data['asks']:
            price, qty = float(price), float(qty)
            value = price * qty
            if value >= threshold_usd:
                large_orders.append({
                    "side": "ASK",
                    "price": price,
                    "qty": qty,
                    "value_usd": value
                })
                
        return large_orders
