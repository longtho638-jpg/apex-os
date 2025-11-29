import unittest
import pandas as pd
import numpy as np
from unittest.mock import MagicMock, patch
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.volume_indicators import VolumeIndicators
from ml.order_flow import OrderFlowAnalyzer

class TestVolumeIndicators(unittest.TestCase):
    def setUp(self):
        # Create dummy OHLCV data
        self.df = pd.DataFrame({
            'open': [100, 102, 101, 103, 104],
            'high': [105, 106, 104, 107, 108],
            'low': [99, 101, 100, 102, 103],
            'close': [102, 101, 103, 104, 106],
            'volume': [1000, 1500, 1200, 1800, 2000]
        })

    def test_vwap(self):
        res = VolumeIndicators.calculate_vwap(self.df.copy())
        self.assertIn('vwap', res.columns)
        self.assertFalse(res['vwap'].isnull().all())

    def test_obv(self):
        res = VolumeIndicators.calculate_obv(self.df.copy())
        self.assertIn('obv', res.columns)
        # First row OBV is 0
        self.assertEqual(res['obv'].iloc[0], 0)

    def test_mfi(self):
        # Need more data for MFI rolling window (14)
        df_long = pd.concat([self.df] * 5, ignore_index=True)
        res = VolumeIndicators.calculate_mfi(df_long, period=14)
        self.assertIn('mfi_14', res.columns)

class TestOrderFlow(unittest.TestCase):
    @patch('requests.get')
    def test_imbalance(self, mock_get):
        # Mock Binance Order Book Response
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "bids": [["50000", "1.0"], ["49990", "2.0"]],
            "asks": [["50010", "1.0"], ["50020", "0.5"]]
        }
        mock_get.return_value = mock_response
        
        analyzer = OrderFlowAnalyzer()
        obi = analyzer.get_order_book_imbalance('BTC/USDT')
        
        # Bids: 1*50000 + 2*49990 = 149980
        # Asks: 1*50010 + 0.5*50020 = 75020
        # Total: 225000
        # OBI: 149980 / 225000 = 0.666...
        
        self.assertGreater(obi, 0.5)

    @patch('requests.get')
    def test_spread(self, mock_get):
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "bids": [["100", "1"]],
            "asks": [["101", "1"]]
        }
        mock_get.return_value = mock_response
        
        analyzer = OrderFlowAnalyzer()
        spread = analyzer.calculate_bid_ask_spread('BTC/USDT')
        # (101 - 100) / 101 * 100 = ~0.99%
        self.assertAlmostEqual(spread, 0.990099, places=4)

if __name__ == '__main__':
    unittest.main()
