import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from typing import Tuple, List, Dict

class DataProcessor:
    def __init__(self, sequence_length: int = 60):
        self.sequence_length = sequence_length
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.feature_columns = ['open', 'high', 'low', 'close', 'volume']

    def prepare_data(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare data for LSTM training.
        Returns: (X, y) where X is (samples, seq_len, features) and y is (samples,)
        """
        # Ensure correct columns
        data = df[self.feature_columns].values
        
        # Normalize
        scaled_data = self.scaler.fit_transform(data)
        
        X, y = [], []
        for i in range(self.sequence_length, len(scaled_data)):
            X.append(scaled_data[i-self.sequence_length:i])
            # Target: 1 if next close > current close, else 0
            # Note: This is a simplified classification target. 
            # For regression, we would predict the next price.
            current_close = data[i-1][3]
            next_close = data[i][3]
            y.append(1 if next_close > current_close else 0)
            
        return np.array(X), np.array(y)

    def preprocess_live(self, candles: List[List[float]]) -> np.ndarray:
        """
        Preprocess a sequence of live candles for inference.
        Input: List of [timestamp, open, high, low, close, volume]
        """
        df = pd.DataFrame(candles, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
        data = df[self.feature_columns].values
        
        # Use the fitted scaler (assuming it was loaded or fitted previously)
        # In production, we should load the scaler state. For now, we fit on the window.
        self.scaler.fit(data) 
        scaled_data = self.scaler.transform(data)
        
        # Return the last sequence
        if len(scaled_data) < self.sequence_length:
            raise ValueError(f"Not enough data. Need {self.sequence_length} candles.")
            
        return np.array([scaled_data[-self.sequence_length:]])
