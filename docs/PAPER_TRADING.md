# Paper Trading System

## Overview
The Paper Trading system allows users to trade with virtual funds (100,000 USDT) to test strategies without risk.

## Architecture
*   **Wallet:** Managed in `paper_wallets` table.
*   **Execution:** Simulated in `PaperTradingEngine` class.
*   **Positions:** Tracked in `paper_positions`.

## Usage

### Start Trading
A paper wallet is automatically created upon the first trade attempt.

### API Endpoints

#### Execute Trade
`POST /api/v1/trading/paper/execute`
```json
{
  "userId": "uuid...",
  "symbol": "BTC/USDT",
  "side": "BUY",
  "quantity": 1.5,
  "price": 50000
}
```

#### Get Portfolio
`GET /api/v1/trading/paper/portfolio?userId=...`

## Features
*   Real-time PnL tracking (via position updates).
*   Support for LIMIT and MARKET orders (currently simulated as instant fills).
*   Full transaction history.
