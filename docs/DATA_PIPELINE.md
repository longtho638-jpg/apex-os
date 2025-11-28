# Data Pipeline Documentation

## Overview
The Apex OS Data Pipeline is responsible for ingesting, processing, and storing cryptocurrency market data to fuel the AI Trading Brain.

## Components

### 1. Binance API Client (`src/lib/binance/client.ts`)
- **Type**: TypeScript Library
- **Purpose**: Robust interaction with Binance API for the frontend and Node.js services.
- **Features**:
  - Rate Limiting: Uses `bottleneck` to enforce 1200 req/min.
  - Retry Logic: Exponential backoff for 429 and 5xx errors.
  - Testnet Support: Toggle via environment variables.

### 2. Data Collection Agent (`backend/agents/data_collection_agent.py`)
- **Type**: Python AsyncIO Service
- **Purpose**: High-throughput background data ingestion.
- **Features**:
  - **Backfill**: Fetches historical OHLCV data (90 days default) for BTC, ETH, BNB.
  - **Real-time**: Continuous polling (1m interval) to keep data fresh.
  - **Storage**: Upserts data to Supabase `market_data_ohlcv` table.
  - **Optimization**: Batch inserts and duplicate handling.

### 3. Database Schema (`market_data_ohlcv`)
- **Storage**: Supabase (PostgreSQL).
- **Structure**:
  - `symbol`: Trading pair (e.g., BTCUSDT).
  - `interval`: Timeframe (1m, 5m, 1h, etc.).
  - `open_time`: Timestamp of candle start.
  - `open`, `high`, `low`, `close`, `volume`: Standard candlestick data.
- **Performance**:
  - Unique constraint on `(symbol, interval, open_time)` prevents duplicates.
  - `latest_prices` Materialized View for sub-millisecond price queries.

## Usage

### Running Backfill
```bash
# From backend/
python agents/data_collection_agent.py --backfill
```

### Running Real-time Collector
```bash
# From backend/
python agents/data_collection_agent.py
```

### Refreshing Materialized View
The view `latest_prices` should be refreshed periodically (e.g., every minute or hour) via Cron or the Agent itself.
```sql
SELECT refresh_latest_prices();
```

## Monitoring
- Check logs in the terminal/console.
- Verify data count in Supabase:
  ```sql
  SELECT count(*) FROM market_data_ohlcv;
  ```
