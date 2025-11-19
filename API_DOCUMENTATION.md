# ApexOS API Documentation

**Base URL:** `http://localhost:8000/api/v1`  
**Version:** 1.0.0  
**Authentication:** Bearer Token (Coming Soon)

---

## 📚 Table of Contents

1. [Authentication](#authentication)
2. [PnL Endpoints](#pnl-endpoints)
3. [Auditor Endpoints](#auditor-endpoints)
4. [Guardian Endpoints](#guardian-endpoints)
5. [Error Codes](#error-codes)
6. [Rate Limits](#rate-limits)

---

## 🔐 Authentication

Currently using query parameter `user_id`. Production will use JWT tokens.

**Example:**
```
GET /api/v1/pnl/summary?user_id=YOUR_USER_ID
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 💰 PnL Endpoints

### GET `/pnl/summary`

Calculate user's profit & loss with statistics.

**Parameters:**
- `user_id` (string, required): User UUID
- `days` (integer, optional): Days to calculate (default: 30)

**Request:**
```bash
curl "http://localhost:8000/api/v1/pnl/summary?user_id=00000000-0000-0000-0000-000000000000&days=30"
```

**Response (200 OK):**
```json
{
  "realized_pnl": -512.44,
  "unrealized_pnl": -117.23,
  "total_pnl": -629.67,
  "total_fees": 211.82,
  "total_funding_fees": 0.0,
  "win_rate": 45.5,
  "total_trades": 33,
  "winning_trades": 15,
  "losing_trades": 18,
  "largest_win": 291.07,
  "largest_loss": -242.89,
  "average_win": 76.7,
  "average_loss": -85.87,
  "profit_factor": 0.74
}
```

**Fields:**
- `realized_pnl`: Profit from closed positions
- `unrealized_pnl`: Current open position P&L
- `total_pnl`: Sum of realized + unrealized
- `win_rate`: Percentage of profitable trades
- `profit_factor`: Gross profit / Gross loss

---

## 🔍 Auditor Endpoints

### POST `/auditor/reconcile`

Reconcile fees (check for discrepancies).

**Parameters:**
- `user_id` (string, required)
- `days` (integer, optional): Default 30

**Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/auditor/reconcile?user_id=demo-user&days=30"
```

**Response (200 OK):**
```json
{
  "total_expected_fees": 211.82,
  "total_actual_fees": 211.82,
  "discrepancy": 0.0,
  "discrepancy_percent": 0.0,
  "flagged_trades_count": 0,
  "flagged_trades": [],
  "status": "normal"
}
```

**Status Values:**
- `normal`: No issues
- `alert`: Discrepancies found
- `no_data`: No trades

---

### GET `/auditor/rebates`

Calculate user rebates.

**Parameters:**
- `user_id` (string, required)
- `days` (integer, optional): Default 30

**Request:**
```bash
curl "http://localhost:8000/api/v1/auditor/rebates?user_id=demo-user"
```

**Response (200 OK):**
```json
{
  "total_fees_paid": 211.82,
  "estimated_commission": 42.36,
  "user_rebate": 36.01,
  "apex_profit": 6.35,
  "rebate_percentage": 17.0,
  "period_days": 30
}
```

**Calculation:**
```
Exchange Commission = Total Fees × 20%
User Rebate = Commission × 85%
Apex Profit = Commission × 15%
```

---

### GET `/auditor/tax-report`

Generate tax report (CSV format).

**Parameters:**
- `user_id` (string, required)
- `year` (integer, required): Tax year (e.g., 2024)

**Request:**
```bash
curl "http://localhost:8000/api/v1/auditor/tax-report?user_id=demo-user&year=2024"
```

**Response (200 OK):**
```json
{
  "year": 2024,
  "total_realized_pnl": -512.44,
  "total_fees": 211.82,
  "net_taxable_income": -724.26,
  "csv_data": "Date,Symbol,Side,Quantity,Price,Fee,PnL\n2024-01-05,BTC/USDT,buy,0.5,42000,21,0\n...",
  "trade_count": 33
}
```

---

## 🛡️ Guardian Endpoints

### GET `/guardian/liquidation-risk`

Check liquidation risk for open positions.

**Parameters:**
- `user_id` (string, required)

**Request:**
```bash
curl "http://localhost:8000/api/v1/guardian/liquidation-risk?user_id=demo-user"
```

**Response (200 OK):**
```json
{
  "positions_at_risk": 0,
  "total_positions": 0,
  "high_risk_positions": [],
  "status": "no_data"
}
```

**With Positions:**
```json
{
  "positions_at_risk": 2,
  "total_positions": 5,
  "high_risk_positions": [
    {
      "symbol": "BTC/USDT",
      "side": "long",
      "entry_price": 40000,
      "current_price": 39500,
      "liquidation_price": 38500,
      "distance_to_liquidation": "2.53%",
      "leverage": 5,
      "risk_level": "critical"
    }
  ],
  "status": "alert"
}
```

**Risk Levels:**
- `low`: >20% from liquidation
- `medium`: 10-20% from liquidation
- `high`: 5-10% from liquidation
- `critical`: <5% from liquidation

---

### GET `/guardian/leverage-check`

Check if user is over-leveraged.

**Parameters:**
- `user_id` (string, required)
- `risk_profile` (string, optional): "conservative" | "moderate" | "aggressive"

**Request:**
```bash
curl "http://localhost:8000/api/v1/guardian/leverage-check?user_id=demo-user&risk_profile=moderate"
```

**Response (200 OK):**
```json
{
  "is_over_leveraged": false,
  "current_leverage": 0.0,
  "max_allowed_leverage": 5,
  "risk_profile": "moderate",
  "recommendation": "No open positions",
  "status": "no_data"
}
```

**Risk Profiles:**
- `conservative`: Max 3x leverage
- `moderate`: Max 5x leverage
- `aggressive`: Max 10x leverage

---

### GET `/guardian/funding-rates`

Monitor funding rates for open positions.

**Parameters:**
- `user_id` (string, required)

**Request:**
```bash
curl "http://localhost:8000/api/v1/guardian/funding-rates?user_id=demo-user"
```

**Response (200 OK):**
```json
{
  "high_funding_positions": [],
  "total_daily_funding": 0.0,
  "total_positions_monitored": 0,
  "status": "no_data",
  "overall_recommendation": "No open positions to monitor"
}
```

**With High Funding:**
```json
{
  "high_funding_positions": [
    {
      "symbol": "BTC/USDT",
      "side": "short",
      "funding_rate": 0.15,
      "annualized_cost": "54.75%",
      "daily_cost_usd": 125.50,
      "recommendation": "High funding cost - consider closing short"
    }
  ],
  "total_daily_funding": 125.50,
  "total_positions_monitored": 3,
  "status": "alert",
  "overall_recommendation": "Monitor funding rates on: BTC/USDT"
}
```

---

## ⚠️ Error Codes

### 400 Bad Request
```json
{
  "detail": "Invalid user_id format"
}
```

### 404 Not Found
```json
{
  "detail": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Database connection failed"
}
```

---

## ⏱️ Rate Limits

**Current Limits:**
- `/pnl/summary`: 60 requests/minute
- `/auditor/*`: 30 requests/minute
- `/guardian/*`: 60 requests/minute

**Rate Limit Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1637856000
```

**429 Too Many Requests:**
```json
{
  "detail": "Rate limit exceeded. Try again in 60 seconds."
}
```

---

## 🔧 Testing

### Using cURL

```bash
# Test PnL
curl "http://localhost:8000/api/v1/pnl/summary?user_id=demo-user"

# Test Auditor
curl -X POST "http://localhost:8000/api/v1/auditor/reconcile?user_id=demo-user"

# Test Guardian  
curl "http://localhost:8000/api/v1/guardian/leverage-check?user_id=demo-user"
```

### Using Python

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"
USER_ID = "demo-user"

# Get PnL
response = requests.get(f"{BASE_URL}/pnl/summary", params={"user_id": USER_ID})
pnl_data = response.json()
print(f"Total PnL: ${pnl_data['total_pnl']}")

# Get Rebates
response = requests.get(f"{BASE_URL}/auditor/rebates", params={"user_id": USER_ID})
rebate_data = response.json()
print(f"Your Rebate: ${rebate_data['user_rebate']}")
```

---

## 📝 Changelog

**v1.0.0 (2025-11-19)**
- Initial API release
- PnL calculation endpoints
- Auditor endpoints
- Guardian risk management

---

**Questions?** Contact: api@apexos.dev
