# Data Pipeline Architecture

## Overview
The data pipeline is responsible for ingesting, processing, and storing market data from Binance (and future exchanges) to fuel the AI trading engine.

## Flow
1.  **Ingestion (Python/Node Agents)**
    *   `DataAgent` (Python) polls REST API for historical/missed data.
    *   `WebsocketClient` (Node/Python) listens for real-time price updates.
2.  **Storage (Supabase)**
    *   `market_data_ohlcv`: Stores candle data.
    *   Optimized for time-series queries.
3.  **Processing (ML Engine)**
    *   Fetch recent candles.
    *   Calculate indicators (RSI, MACD, Bollinger Bands).
    *   Run inference (ML Model).
4.  **Execution (Trading Engine)**
    *   Receive signal.
    *   Execute trade via `BinanceClient`.

## Schema
See `supabase/migrations/20251127_market_data.sql`.

## Rate Limits
Binance has strict rate limits (IP and Order based).
*   The `DataAgent` uses `ccxt`'s built-in rate limiting.
*   The Node `BinanceClient` handles 429 errors gracefully.
