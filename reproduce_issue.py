import sys
from unittest.mock import MagicMock
import pandas as pd
import numpy as np

# Mock ta
mock_ta = MagicMock()
sys.modules["ta"] = mock_ta
sys.modules["ta.trend"] = MagicMock()
sys.modules["ta.momentum"] = MagicMock()
sys.modules["ta.volatility"] = MagicMock()

# Import FeatureEngineer (copy-pasted or imported if path setup)
# For reproduction, I'll essentially paste the relevant logic of create_features

def create_features(df):
    # Ensure numerical types
    numeric_cols = ['open', 'high', 'low', 'close', 'volume']
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col])

import sys
from unittest.mock import MagicMock
import pandas as pd
import numpy as np

# Mock ta mocks setup (copied from test_model.py)
dates = pd.date_range(start='2023-01-01', periods=200, freq='5min')
mock_series_zeros = pd.Series(np.zeros(200), index=dates)
mock_series_ones = pd.Series(np.ones(200), index=dates)

# Mock ta
mock_ta = MagicMock()
sys.modules["ta"] = mock_ta
sys.modules["ta.trend"] = MagicMock()
sys.modules["ta.momentum"] = MagicMock()
sys.modules["ta.volatility"] = MagicMock()

# Configure RSI
mock_rsi_indicator = MagicMock()
mock_rsi_indicator.rsi.return_value = mock_series_zeros
sys.modules["ta.momentum"].RSIIndicator.return_value = mock_rsi_indicator

# Configure MACD
mock_macd = MagicMock()
mock_macd.macd.return_value = mock_series_zeros
mock_macd.macd_signal.return_value = mock_series_zeros
mock_macd.macd_diff.return_value = mock_series_zeros
sys.modules["ta.trend"].MACD.return_value = mock_macd

# Configure Bollinger Bands
mock_bb = MagicMock()
mock_bb.bollinger_hband.return_value = mock_series_zeros
mock_bb.bollinger_lband.return_value = mock_series_zeros
mock_bb.bollinger_mavg.return_value = mock_series_ones
sys.modules["ta.volatility"].BollingerBands.return_value = mock_bb

# Now import FeatureEngineer
# We need to assume backend/ml/features.py exists and import from it
# But since this script is in root apps/apex-os/, we need to adjust path
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from ml.features import FeatureEngineer

# Setup data
df = pd.DataFrame({
    'open': np.random.rand(200) * 100 + 100,
    'high': np.random.rand(200) * 100 + 110,
    'low': np.random.rand(200) * 100 + 90,
    'close': np.random.rand(200) * 100 + 105,
    'volume': np.random.rand(200) * 1000
}, index=dates)

fe = FeatureEngineer()
print(f"Input DF Length: {len(df)}")
df_out = fe.create_features(df)
print(f"Output DF Length: {len(df_out)}")

# Debug which columns have NaNs if empty
if len(df_out) == 0:
    # Re-run but check NaNs before drop
    # We can't easily modify the class method instance, but we can copy the logic or inspect the df state if we could?
    # Actually, let's just inspect what create_features returned (it returned empty)
    # Let's manually run the steps here to see

    df_debug = df.copy()
    numeric_cols = ['open', 'high', 'low', 'close', 'volume']
    for col in numeric_cols:
        df_debug[col] = pd.to_numeric(df_debug[col])

    from ta.momentum import RSIIndicator
    df_debug['rsi_14'] = RSIIndicator(close=df_debug['close'], window=14).rsi()
    print("RSI NaN count:", df_debug['rsi_14'].isna().sum())

    from ta.volatility import BollingerBands
    bb = BollingerBands(close=df_debug['close'])
    df_debug['bb_high'] = bb.bollinger_hband()
    df_debug['bb_mid'] = bb.bollinger_mavg()
    print("BB Mid NaN count:", df_debug['bb_mid'].isna().sum())
    print("BB Mid first 5:", df_debug['bb_mid'].head())

    # Check rolling
    df_debug['sma_50'] = df_debug['close'].rolling(window=50).mean()
    print("SMA_50 NaN count:", df_debug['sma_50'].isna().sum())

    # Check shift logic
    future_close = df_debug['close'].shift(-12)
    # Comparison results in boolean, astype(int) -> 0/1. No NaNs.
    df_debug['target'] = (future_close > df_debug['close'] * 1.01).astype(int)
    print("Target NaN count:", df_debug['target'].isna().sum())

    # Check all columns
    print("\nNaN counts per column:")
    print(df_debug.isna().sum())

