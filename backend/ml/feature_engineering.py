import pandas as pd
import numpy as np

def calculate_rsi(data, periods=14):
    delta = data.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=periods).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=periods).mean()
    
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def add_indicators(df):
    """
    Adds technical indicators to the dataframe.
    Expects 'close' column.
    """
    df = df.copy()
    
    # RSI
    df['rsi_14'] = calculate_rsi(df['close'], 14)
    
    # SMA
    df['sma_20'] = df['close'].rolling(window=20).mean()
    df['sma_50'] = df['close'].rolling(window=50).mean()
    
    # Bollinger Bands
    df['bb_upper'] = df['sma_20'] + (df['close'].rolling(window=20).std() * 2)
    df['bb_lower'] = df['sma_20'] - (df['close'].rolling(window=20).std() * 2)
    
    # MACD
    exp1 = df['close'].ewm(span=12, adjust=False).mean()
    exp2 = df['close'].ewm(span=26, adjust=False).mean()
    df['macd'] = exp1 - exp2
    df['signal_line'] = df['macd'].ewm(span=9, adjust=False).mean()
    
    return df.dropna()
