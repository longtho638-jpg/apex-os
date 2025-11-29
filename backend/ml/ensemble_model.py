import numpy as np
import pandas as pd
import joblib
import os
from typing import Dict, Any
from .opportunity_detector import OpportunityDetector
from .features import FeatureEngineer

class EnsembleModel:
    def __init__(self):
        self.price_model = OpportunityDetector()
        # Try to load pre-trained price model if exists
        try:
            self.price_model.load_model()
        except Exception:
            print("Warning: Pre-trained price model not found. Predictions will be random.")
            
        # Weights
        self.W_PRICE = 0.5
        self.W_SENTIMENT = 0.3
        self.W_VOLUME = 0.2
        
    def predict_ensemble(self, 
                         price_data: pd.DataFrame, 
                         sentiment_score: float, 
                         volume_signals: Dict[str, float]) -> Dict[str, Any]:
        """
        Combine signals into ensemble prediction.
        
        Args:
            price_data: OHLCV dataframe for price model
            sentiment_score: -1.0 to 1.0 from social sentiment
            volume_signals: Dictionary with 'vwap_dist', 'obv_slope', 'imbalance' etc.
            
        Returns:
            Dictionary with prediction, confidence, and contributions
        """
        # 1. Price Model Prediction
        # Ensure we have enough data
        price_prob = 0.5
        try:
            if not price_data.empty:
                # Predict returns list of dicts, get last one
                results = self.price_model.predict(price_data)
                if results:
                    price_prob = results[-1]['probability']
        except Exception as e:
            print(f"Price model error: {e}")
            
        # 2. Sentiment Score Normalization (-1 to 1 -> 0 to 1)
        # -1 (Bearish) -> 0.0
        # 0 (Neutral) -> 0.5
        # 1 (Bullish) -> 1.0
        sent_prob = (sentiment_score + 1) / 2
        
        # 3. Volume/Whale Score Normalization
        # Expect volume signals to be normalized or we interpret them here
        # Simple heuristic aggregation for MVP:
        # Imbalance > 0.6 -> Bullish
        # Whale Inflow -> Bullish
        vol_score = 0.5
        if volume_signals:
            imbalance = volume_signals.get('order_imbalance', 0.5)
            # normalize imbalance (0-1) is already prob-like
            
            # Whale activity: 1 if net inflow, 0 if net outflow (simplified)
            whale_score = 0.5 
            
            vol_score = (imbalance + whale_score) / 2
            
        # 4. Weighted Ensemble
        ensemble_prob = (
            (price_prob * self.W_PRICE) +
            (sent_prob * self.W_SENTIMENT) +
            (vol_score * self.W_VOLUME)
        )
        
        # 5. Decision Logic
        prediction = "HOLD"
        confidence = abs(ensemble_prob - 0.5) * 2 # Map 0.5->0, 1.0->1, 0.0->1
        
        if ensemble_prob > 0.6:
            prediction = "BUY"
        elif ensemble_prob < 0.4:
            prediction = "SELL"
            
        return {
            "symbol": "UNKNOWN", # Set by caller
            "prediction": prediction,
            "probability": float(ensemble_prob),
            "confidence": float(confidence),
            "contributions": {
                "price": float(price_prob),
                "sentiment": float(sent_prob),
                "volume": float(vol_score)
            }
        }

    def get_weights(self):
        return {
            "price": self.W_PRICE,
            "sentiment": self.W_SENTIMENT,
            "volume": self.W_VOLUME
        }
