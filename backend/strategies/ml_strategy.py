from .base import BaseStrategy
from typing import Dict, Any
import torch
import numpy as np
from ..ml.registry import ModelRegistry
from ..ml.models.lstm import PricePredictorLSTM
from ..ml.data_processor import DataProcessor

class MLStrategy(BaseStrategy):
    def __init__(self, name: str, config: Dict[str, Any]):
        super().__init__(name, config)
        self.registry = ModelRegistry()
        self.processor = DataProcessor(sequence_length=60)
        self.model = self._load_model()
        self.confidence_threshold = config.get('confidence_threshold', 0.7)

    def _load_model(self):
        try:
            # Load latest LSTM model
            model = self.registry.load_latest_model(PricePredictorLSTM, "lstm_v1")
            return model
        except Exception as e:
            self.logger.error(f"Failed to load model: {e}")
            return None

    async def analyze(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        ML Strategy Analysis:
        1. Preprocess live candles
        2. Run model inference
        3. Generate signal if confidence > threshold
        """
        if not self.model:
            return {'action': 'HOLD', 'confidence': 0.0, 'metadata': {'error': 'No model loaded'}}

        candles = market_data.get('candles', [])
        if len(candles) < 60:
            return {'action': 'HOLD', 'confidence': 0.0, 'metadata': {'reason': 'Insufficient data'}}

        try:
            # 1. Preprocess
            input_seq = self.processor.preprocess_live(candles)
            input_tensor = torch.from_numpy(input_seq).float()

            # 2. Inference
            with torch.no_grad():
                prediction = self.model(input_tensor).item()

            # 3. Logic
            signal = {'action': 'HOLD', 'confidence': float(prediction), 'metadata': {'model': 'LSTM_v1'}}
            
            if prediction > self.confidence_threshold:
                signal['action'] = 'BUY'
            elif prediction < (1 - self.confidence_threshold):
                signal['action'] = 'SELL'
                signal['confidence'] = 1 - prediction

            return signal

        except Exception as e:
            self.logger.error(f"Inference error: {e}")
            return {'action': 'HOLD', 'confidence': 0.0, 'metadata': {'error': str(e)}}

    async def on_tick(self, market_data: Dict[str, Any]):
        if not self.is_active:
            return
        
        signal = await self.analyze(market_data)
        if signal['action'] != 'HOLD':
            self.log_signal(signal)
