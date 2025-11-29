import unittest
import pandas as pd
import numpy as np
from opportunity_detector import OpportunityDetector
import os
import shutil

class TestOpportunityDetector(unittest.TestCase):
    def setUp(self):
        # Create dummy OHLCV data
        # Generate 200 rows to allow for windowing (50) + lag
        dates = pd.date_range(start='2023-01-01', periods=200, freq='5min')
        self.df = pd.DataFrame({
            'open': np.random.rand(200) * 100 + 100,
            'high': np.random.rand(200) * 100 + 110,
            'low': np.random.rand(200) * 100 + 90,
            'close': np.random.rand(200) * 100 + 105,
            'volume': np.random.rand(200) * 1000
        }, index=dates)
        
        self.detector = OpportunityDetector()
        # Use a temp dir for models
        self.detector.model_dir = 'backend/ml/test_models'
        os.makedirs(self.detector.model_dir, exist_ok=True)

    def tearDown(self):
        # Cleanup
        if os.path.exists(self.detector.model_dir):
            shutil.rmtree(self.detector.model_dir)

    def test_training_flow(self):
        metrics = self.detector.train(self.df)
        self.assertIn('accuracy', metrics)
        self.assertGreaterEqual(metrics['accuracy'], 0.0)
        self.assertTrue(os.path.exists(f'{self.detector.model_dir}/opportunity_detector_v1.0.0.pkl'))

    def test_prediction_flow(self):
        # Train first
        self.detector.train(self.df)
        
        # Predict on same data (just for smoke test)
        results = self.detector.predict(self.df)
        self.assertIsInstance(results, list)
        if len(results) > 0:
            self.assertIn('prediction', results[0])
            self.assertIn('probability', results[0])

if __name__ == '__main__':
    unittest.main()
