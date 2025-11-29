from .features import FeatureEngineer
from .volume_indicators import VolumeIndicators
from .order_flow import OrderFlowAnalyzer
import pandas as pd

class EnhancedFeatureEngineer(FeatureEngineer):
    """
    Combines Technical, Volume, and Order Flow features
    """
    
    def __init__(self):
        super().__init__()
        self.order_flow = OrderFlowAnalyzer()
        
    def create_enhanced_features(self, df: pd.DataFrame, symbol: str) -> pd.DataFrame:
        """
        Create comprehensive feature set (21+ features)
        """
        # 1. Basic Features (RSI, MACD, etc.)
        df = self.create_features(df)
        
        # 2. Volume Indicators
        df = VolumeIndicators.add_all_indicators(df)
        
        # 3. Order Flow (Snapshot added to latest row)
        # Note: Order flow is real-time snapshot, not historical. 
        # For training, we need historical depth data (rare).
        # For inference, we append current metrics.
        # Strategy: If historical depth missing, use Volume Imbalance proxy.
        
        # Proxy Order Flow with Volume Imbalance
        # (Close - Open) / (High - Low) gives candle strength
        df['candle_strength'] = (df['close'] - df['open']) / (df['high'] - df['low'])
        
        # Add Order Book features only to the last row if doing realtime inference
        # Or fetch realtime and broadcast (simplified here)
        
        try:
            obi = self.order_flow.get_order_book_imbalance(symbol)
            spread = self.order_flow.calculate_bid_ask_spread(symbol)
            
            # Valid only for current inference row
            # We'll add columns with 0.5 default and update last
            df['order_imbalance'] = 0.5
            df['bid_ask_spread'] = 0.0
            
            df.iloc[-1, df.columns.get_loc('order_imbalance')] = obi
            df.iloc[-1, df.columns.get_loc('bid_ask_spread')] = spread
            
        except Exception:
            pass # Fail soft if API error
            
        # Update feature columns list
        self.feature_columns.extend([
            'vwap', 'obv', 'vroc_14', 'ad_line', 'mfi_14',
            'candle_strength', 'order_imbalance', 'bid_ask_spread'
        ])
        
        return df
