import unittest
from unittest.mock import MagicMock, patch
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.sentiment_analyzer import SentimentAnalyzer

class TestSentimentAnalyzer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Mock tokenizer and model to avoid downloading 400MB during test
        cls.mock_tokenizer = MagicMock()
        cls.mock_model = MagicMock()
        
    def setUp(self):
        with patch("ml.sentiment_analyzer.AutoTokenizer.from_pretrained") as mock_tok, \
             patch("ml.sentiment_analyzer.AutoModelForSequenceClassification.from_pretrained") as mock_mod:
            
            mock_tok.return_value = MagicMock()
            mock_mod.return_value = MagicMock()
            
            # Mock config
            mock_mod.return_value.config.id2label = {0: 'positive', 1: 'negative', 2: 'neutral'}
            
            self.analyzer = SentimentAnalyzer()
            # Inject mocks into instance
            self.analyzer.tokenizer = mock_tok.return_value
            self.analyzer.model = mock_mod.return_value

    def test_aggregate_sentiment(self):
        results = [
            {"sentiment": "bullish", "confidence": 0.9},
            {"sentiment": "bearish", "confidence": 0.9},
            {"sentiment": "neutral", "confidence": 0.5}
        ]
        # (1*0.9 + -1*0.9 + 0*0.5) / (0.9+0.9+0.5) = 0 / 2.3 = 0
        score = self.analyzer.aggregate_sentiment(results)
        self.assertAlmostEqual(score, 0.0)
        
        results_bullish = [
            {"sentiment": "bullish", "confidence": 0.9},
            {"sentiment": "bullish", "confidence": 0.8}
        ]
        score = self.analyzer.aggregate_sentiment(results_bullish)
        self.assertGreater(score, 0.8)

    def test_batch_analyze_empty(self):
        self.assertEqual(self.analyzer.batch_analyze([]), [])

if __name__ == '__main__':
    unittest.main()
