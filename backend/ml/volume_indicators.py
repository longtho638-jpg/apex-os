import pandas as pd
import numpy as np

class VolumeIndicators:
    """
    Advanced Volume Indicators for Crypto Trading
    """
    
    @staticmethod
    def calculate_vwap(df: pd.DataFrame) -> pd.DataFrame:
        """Volume Weighted Average Price"""
        # Typical Price
        tp = (df['high'] + df['low'] + df['close']) / 3
        # Cumulative TP * Vol
        cum_vp = (tp * df['volume']).cumsum()
        # Cumulative Vol
        cum_vol = df['volume'].cumsum()
        
        df['vwap'] = cum_vp / cum_vol
        return df

    @staticmethod
    def calculate_obv(df: pd.DataFrame) -> pd.DataFrame:
        """On-Balance Volume"""
        df['obv'] = 0.0
        # Vectorized calculation
        change = df['close'].diff()
        
        # Direction: 1 if up, -1 if down, 0 if unchanged
        # Note: np.where returns elements chosen from x or y depending on condition.
        direction = np.where(change > 0, 1, np.where(change < 0, -1, 0))
        
        # Multiply direction by volume
        vol_flow = direction * df['volume']
        
        # Cumulative sum
        # We need to handle the first element. diff() gives NaN at index 0.
        # Standard OBV starts at 0 or arbitrary value.
        # If we use cumsum(), NaN propagates? No, cumsum ignores NaNs usually or we fill.
        
        # Let's fill initial NaN in 'change' or 'direction' with 0
        # Actually, direction array will have 0 at index 0 if change is NaN? 
        # change[0] is NaN. np.where(NaN > 0) is False. np.where(NaN < 0) is False. So 0.
        # So vol_flow[0] is 0 * volume[0] = 0.
        # This means OBV starts at 0.
        
        df['obv'] = vol_flow.cumsum()
        return df

    @staticmethod
    def calculate_vroc(df: pd.DataFrame, period: int = 14) -> pd.DataFrame:
        """Volume Rate of Change"""
        df[f'vroc_{period}'] = df['volume'].pct_change(periods=period) * 100
        return df

    @staticmethod
    def calculate_ad_line(df: pd.DataFrame) -> pd.DataFrame:
        """Accumulation/Distribution Line"""
        # Money Flow Multiplier = [(Close  -  Low) - (High - Close)] /(High - Low) 
        mf_multiplier = ((df['close'] - df['low']) - (df['high'] - df['close'])) / (df['high'] - df['low'])
        # Handle divide by zero (if high == low)
        mf_multiplier = mf_multiplier.replace([np.inf, -np.inf], 0).fillna(0)
        
        mf_volume = mf_multiplier * df['volume']
        df['ad_line'] = mf_volume.cumsum()
        return df

    @staticmethod
    def calculate_mfi(df: pd.DataFrame, period: int = 14) -> pd.DataFrame:
        """Money Flow Index"""
        # Typical Price
        tp = (df['high'] + df['low'] + df['close']) / 3
        
        # Raw Money Flow
        raw_mf = tp * df['volume']
        
        # Positive/Negative Flow
        # Compare current TP with previous TP
        # If current > prev, flow is positive
        diff = tp.diff()
        
        pos_flow = pd.Series(0.0, index=df.index)
        neg_flow = pd.Series(0.0, index=df.index)
        
        pos_flow[diff > 0] = raw_mf[diff > 0]
        neg_flow[diff < 0] = raw_mf[diff < 0]
        
        # Sum over period
        pos_mf_sum = pos_flow.rolling(window=period).sum()
        neg_mf_sum = neg_flow.rolling(window=period).sum()
        
        # Money Flow Ratio
        # Add epsilon to avoid div by zero
        mfr = pos_mf_sum / (neg_mf_sum + 1e-10)
        
        # MFI
        df[f'mfi_{period}'] = 100 - (100 / (1 + mfr))
        return df

    @staticmethod
    def add_all_indicators(df: pd.DataFrame) -> pd.DataFrame:
        """Apply all volume indicators to dataframe"""
        # Ensure numeric types
        cols = ['open', 'high', 'low', 'close', 'volume']
        for c in cols:
            df[c] = pd.to_numeric(df[c])
            
        df = VolumeIndicators.calculate_vwap(df)
        df = VolumeIndicators.calculate_obv(df)
        df = VolumeIndicators.calculate_vroc(df)
        df = VolumeIndicators.calculate_ad_line(df)
        df = VolumeIndicators.calculate_mfi(df)
        
        return df