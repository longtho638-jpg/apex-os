# ML Opportunity Detector

## Architecture
The Opportunity Detector is a hybrid engine combining rule-based heuristics and Machine Learning models to identify profitable trade setups.

## Components

### 1. Feature Engineering (`backend/ml/feature_engineering.py`)
Extracts technical indicators from OHLCV data:
*   RSI (14)
*   SMA (20, 50)
*   MACD (12, 26, 9)
*   Bollinger Bands

### 2. Detector Engine (`backend/ml/opportunity_detector.py`)
**Phase 1 (Current):** Rule-based Logic
*   **Oversold Bounce:** RSI < 30 + Price below Lower BB
*   **Overbought Pullback:** RSI > 70 + Price above Upper BB

**Phase 2 (Next):** Random Forest Classifier
*   Trained on 1 year of historical data.
*   Labels: Future price increase > 1% within 1 hour.

## Usage
The `DataAgent` feeds data to this detector, which then pushes `trading_signals` to the database.
