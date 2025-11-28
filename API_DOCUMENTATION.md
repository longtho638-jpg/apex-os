---

## 📈 Advanced Trading Endpoints

### POST `/trade/orders`
Place a new order (Market, Limit, Stop, OCO).

**Auth:** Bearer Token

**Body:**
```json
{
  "symbol": "BTC/USDT",
  "side": "buy",
  "type": "limit", // market, limit, stop_loss, stop_limit, oco
  "quantity": 0.5,
  "price": 95000.00, // Required for Limit
  "stop_price": 94000.00 // Required for Stop/OCO
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "order_id": "uuid..."
}
```

---

## 🤖 Institutional API (High Frequency)

**Base URL:** `/api/v1/institutional`
**Auth:** API Key & Signature (Headers)

**Headers:**
- `x-api-key`: Your Public Access Key
- `x-api-timestamp`: Unix Timestamp (ms)
- `x-api-signature`: HMAC_SHA256(timestamp + method + path + body, secret_key)

### POST `/institutional/trade`
High-throughput order placement (Bypasses standard middleware, rate limit: 50/sec).

**Body:** (Same as `/trade/orders`)

**Response:**
```json
{
  "success": true,
  "order_id": "uuid...",
  "status": "pending",
  "latency_ms": "1.23"
}
```

---

## 📊 Analytics Endpoints

### GET `/user/analytics/pnl`
Get Portfolio PnL summary and chart data.

**Parameters:**
- `range`: 7d | 30d | 90d

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_realized_pnl": 1500.50,
      "trade_count": 42,
      "volume": 500000.00
    },
    "chart": [
      { "date": "2025-11-01", "value": 1200.00 },
      ...
    ]
  }
}
```