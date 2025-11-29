import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch.nn.functional as F
import os
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    def __init__(self, model_path="ProsusAI/finbert"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model_path = model_path
        self.tokenizer = None
        self.model = None
        self._load_model()

    def _load_model(self):
        try:
            start_time = time.time()
            logger.info(f"Loading FinBERT model from {self.model_path}...")
            
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
            self.model = AutoModelForSequenceClassification.from_pretrained(self.model_path)
            self.model.to(self.device)
            self.model.eval()
            
            logger.info(f"Model loaded in {time.time() - start_time:.2f}s on {self.device}")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise

    def analyze_tweet(self, text: str):
        """Analyze a single tweet. Returns {sentiment, confidence}"""
        if not text:
            return {"sentiment": "neutral", "confidence": 0.0}

        try:
            inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            with torch.no_grad():
                outputs = self.model(**inputs)
                probs = F.softmax(outputs.logits, dim=1)

            # ProsusAI/finbert labels: [positive, negative, neutral] -> check config
            # Usually: 0: positive, 1: negative, 2: neutral OR map from id2label
            
            labels = self.model.config.id2label
            # Example: {0: 'positive', 1: 'negative', 2: 'neutral'}
            
            score, class_idx = torch.max(probs, dim=1)
            sentiment_label = labels[class_idx.item()]
            confidence = score.item()

            # Normalize to standard bullish/bearish/neutral
            mapped_sentiment = "neutral"
            if sentiment_label == "positive":
                mapped_sentiment = "bullish"
            elif sentiment_label == "negative":
                mapped_sentiment = "bearish"

            return {
                "sentiment": mapped_sentiment,
                "confidence": confidence
            }
        except Exception as e:
            logger.error(f"Error analyzing tweet: {e}")
            return {"sentiment": "error", "confidence": 0.0}

    def batch_analyze(self, texts: list):
        """Analyze a batch of tweets. Returns list of results."""
        if not texts:
            return []
            
        try:
            inputs = self.tokenizer(texts, return_tensors="pt", truncation=True, padding=True, max_length=512)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            with torch.no_grad():
                outputs = self.model(**inputs)
                probs = F.softmax(outputs.logits, dim=1)

            results = []
            labels = self.model.config.id2label
            
            for i in range(len(texts)):
                score, class_idx = torch.max(probs[i], dim=0)
                sentiment_label = labels[class_idx.item()]
                confidence = score.item()
                
                mapped_sentiment = "neutral"
                if sentiment_label == "positive":
                    mapped_sentiment = "bullish"
                elif sentiment_label == "negative":
                    mapped_sentiment = "bearish"
                    
                results.append({
                    "text": texts[i],
                    "sentiment": mapped_sentiment,
                    "confidence": confidence
                })
                
            return results
        except Exception as e:
            logger.error(f"Batch analysis failed: {e}")
            # Fallback to single processing if batch fails (e.g. memory)
            return [self.analyze_tweet(t) for t in texts]

    def aggregate_sentiment(self, results: list):
        """Aggregate sentiment from a list of analyzed results (-1 to 1)"""
        if not results:
            return 0.0
            
        score_map = {"bullish": 1.0, "bearish": -1.0, "neutral": 0.0}
        total_score = 0.0
        total_weight = 0.0
        
        for res in results:
            weight = res.get('confidence', 0.5)
            val = score_map.get(res.get('sentiment', 'neutral'), 0.0)
            total_score += val * weight
            total_weight += weight
            
        if total_weight == 0:
            return 0.0
            
        return total_score / total_weight
