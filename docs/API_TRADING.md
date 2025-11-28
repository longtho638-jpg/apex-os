# Trading Engine - API Documentation

## Overview
REST API endpoints for trading operations, position management, and PnL tracking.

**Base URL**: `http://localhost:3000/api/v1`  
**Authentication**: Required (JWT token)

---

## Orders API

### Create Order
Place a new market order.

**Endpoint**: `POST /trading/orders`

**Request Body**:
```json
{
  "userId": "f9d6f7ca-f232-4145-b454-af58d78e227e",
  "symbol": "BTC/USDT",
  "side": "BUY",
  "quantity": 0.001,
  "type": "MARKET",
  "price": 50000  // Optional for MARKET orders
}
```

**Response** (Success):
```json
{
  "success": true,
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "f9d6f7ca-f232-4145-b454-af58d78e227e",
    "symbol": "BTC/USDT",
    "side": "BUY",
    "quantity": 0.001,
    "price": 50000,
    "status": "FILLED",
    "exchange_order_id": "PAPER_1234567890",
    "created_at": "2025-11-24T00:00:00Z"
  }
}
```

**Response** (Error):
```json
{
  "error": "Risk Check Failed: Exposure would exceed 80%"
}
```

### List Orders
Get user's order history.

**Endpoint**: `GET /trading/orders?userId={userId}&status={status}`

**Query Parameters**:
- `userId` (required): User ID
- `status` (optional): FILLED | PENDING | CANCELLED | REJECTED

**Response**:
```json
{
  "success": true,
  "orders": [
    {
      "id": "...",
      "symbol": "BTC/USDT",
      "side": "BUY",
      "quantity": 0.001,
      "price": 50000,
      "status": "FILLED",
      "created_at": "..."
    }
  ]
}
```

---

## Positions API

### List Positions
Get user's trading positions.

**Endpoint**: `GET /trading/positions?userId={userId}&status={status}`

**Query Parameters**:
- `userId` (required): User ID
- `status` (optional): OPEN | CLOSED | LIQUIDATED

**Response**:
```json
{
  "success": true,
  "positions": [
    {
      "id": "...",
      "symbol": "BTC/USDT",
      "side": "LONG",
      "entry_price": 50000,
      "current_price": 51000,
      "quantity": 0.001,
      "leverage": 1,
      "unrealized_pnl": 1.0,
      "status": "OPEN",
      "opened_at": "...",
      "liquidation_price": 45000
    }
  ]
}
```

### Close Position
Close an open position.

**Endpoint**: `POST /trading/positions`

**Request Body**:
```json
{
  "positionId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "f9d6f7ca-f232-4145-b454-af58d78e227e"
}
```

**Response**:
```json
{
  "success": true,
  "position": {
    "id": "...",
    "status": "CLOSED",
    "closed_at": "2025-11-24T00:00:00Z"
  }
}
```

---

## Wallet API

### Get Balance
Retrieve user's wallet balance.

**Endpoint**: `GET /wallets?userId={userId}`

**Response**:
```json
{
  "balance": 100000.00,
  "currency": "USDT"
}
```

---

## Market Data API

### Get Current Price
Fetch latest market price for a symbol.

**Endpoint**: `GET /market_data/{symbol}`

**Example**: `/market_data/BTC/USDT`

**Response**:
```json
{
  "symbol": "BTC/USDT",
  "price": 50000.00,
  "bid": 49995.00,
  "ask": 50005.00,
  "volume_24h": 1234567.89,
  "change_24h": 2.5,
  "updated_at": "2025-11-24T00:00:00Z"
}
```

---

## Error Codes

| Code | Message | Solution |
|------|---------|----------|
| 400 | Missing required fields | Check request body |
| 401 | Unauthorized | Provide valid JWT token |
| 403 | Risk limit exceeded | Reduce position size |
| 404 | Position not found | Verify position ID |
| 500 | Internal server error | Check server logs |

---

## Rate Limits

- **Orders**: 10 requests/minute per user
- **Positions**: 30 requests/minute per user
- **Market Data**: 60 requests/minute per user

Exceeding limits returns:
```json
{
  "error": "Rate limit exceeded. Try again in 60 seconds."
}
```

---

## WebSocket API

### Connect
```javascript
const ws = new WebSocket('ws://localhost:8080');
```

### Subscribe to Prices
```javascript
ws.send(JSON.stringify({
  type: 'SUBSCRIBE',
  symbols: ['BTC/USDT', 'ETH/USDT']
}));
```

### Receive Updates
```javascript
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'PRICE_UPDATE') {
    console.log(message.data);
    // { symbol: 'BTC/USDT', price: 50000, bid: 49995, ask: 50005, timestamp: 1234567890 }
  }
};
```

### Heartbeat
```javascript
// Send ping every 30 seconds
setInterval(() => {
  ws.send(JSON.stringify({ type: 'PING' }));
}, 30000);
```

---

## Example Workflows

### Place Order & Monitor Position
```javascript
// 1. Place order
const orderRes = await fetch('/api/v1/trading/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'abc123',
    symbol: 'BTC/USDT',
    side: 'BUY',
    quantity: 0.001,
    type: 'MARKET'
  })
});

const { order } = await orderRes.json();

// 2. Get positions
const posRes = await fetch('/api/v1/trading/positions?userId=abc123&status=OPEN');
const { positions } = await posRes.json();

// 3. Close position when profitable
if (positions[0].unrealized_pnl > 10) {
  await fetch('/api/v1/trading/positions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      positionId: positions[0].id,
      userId: 'abc123'
    })
  });
}
```

---

**Version**: Phase 3 - Trading Engine Core  
**Last Updated**: 2025-11-24
