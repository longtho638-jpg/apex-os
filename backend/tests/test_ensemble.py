import unittest
from unittest.mock import MagicMock
import pandas as pd
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.ensemble_model import EnsembleModel

class TestEnsembleModel(unittest.TestCase):
    def setUp(self):
        self.model = EnsembleModel()
        # Mock price model
        self.model.price_model = MagicMock()
        self.model.price_model.predict.return_value = [{'probability': 0.8}] # Bullish price

    def test_predict_ensemble_buy(self):
        # Strong buy scenario
        # Price: 0.8 (Bullish) * 0.5 = 0.4
        # Sentiment: 0.8 (Bullish) -> (0.8+1)/2 = 0.9 * 0.3 = 0.27
        # Volume: Imbalance 0.8 -> 0.8 * 0.2 = 0.16
        # Total: 0.4 + 0.27 + 0.16 = 0.83 (> 0.6 threshold)
        
        result = self.model.predict_ensemble(
            price_data=pd.DataFrame({'close': [100]}),
            sentiment_score=0.8,
            volume_signals={'order_imbalance': 0.8}
        )
        
        self.assertEqual(result['prediction'], 'BUY')
        self.assertGreater(result['confidence'], 0.6)

    def test_predict_ensemble_sell(self):
        # Strong sell scenario
        self.model.price_model.predict.return_value = [{'probability': 0.2}] # Bearish
        
        # Price: 0.2 * 0.5 = 0.1
        # Sentiment: -0.8 -> (-0.8+1)/2 = 0.1 * 0.3 = 0.03
        # Volume: 0.2 * 0.2 = 0.04
        # Total: 0.17 (< 0.4 threshold)
        
        result = self.model.predict_ensemble(
            price_data=pd.DataFrame({'close': [100]}),
            sentiment_score=-0.8,
            volume_signals={'order_imbalance': 0.2}
        )
        
        self.assertEqual(result['prediction'], 'SELL')

if __name__ == '__main__':
    unittest.main()
