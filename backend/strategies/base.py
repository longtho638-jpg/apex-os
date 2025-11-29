from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import logging
from datetime import datetime

class BaseStrategy(ABC):
    def __init__(self, name: str, config: Dict[str, Any]):
        self.name = name
        self.config = config
        self.logger = logging.getLogger(f"strategy.{name}")
        self.position = None
        self.is_active = True

    @abstractmethod
    async def analyze(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze market data and return a signal.
        Signal format: {'action': 'BUY'|'SELL'|'HOLD', 'confidence': float, 'metadata': dict}
        """
        pass

    @abstractmethod
    async def on_tick(self, market_data: Dict[str, Any]):
        """
        Called on every market tick. Orchestrates analysis and execution.
        """
        pass

    def log_signal(self, signal: Dict[str, Any]):
        self.logger.info(f"Signal generated: {signal}")

    def validate_config(self, required_keys: list):
        for key in required_keys:
            if key not in self.config:
                raise ValueError(f"Missing config key: {key}")
