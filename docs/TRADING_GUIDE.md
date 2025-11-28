# Trading Engine - User Guide

## Overview
The Apex OS Trading Engine provides real-time trading capabilities with institutional-grade risk management and monitoring.

---

## Features

### 1. Real-Time Price Streaming
- **WebSocket Connection**: Live prices from Binance via CCXT
- **Supported Pairs**: BTC/USDT, ETH/USDT, SOL/USDT, BNB/USDT
- **Update Frequency**: ~1 second
- **Auto-Reconnect**: 3-second delay on disconnect

### 2. Trading Interface
- **Quick Trade Panel**: One-click BUY/SELL with live prices
- **Market Orders**: Instant execution at current market price
- **Position Tracking**: Real-time PnL updates
- **Risk Warnings**: Exposure limits enforced

### 3. Position Management
- **Live PnL Calculation**: Updated every price tick
- **Color-Coded Display**: Green (profit) / Red (loss)
- **Close Position**: One-click exit with confirmation
- **Auto-Refresh**: Position list updates every 30s

### 4. PnL Analytics
- **Total PnL**: Realized + Unrealized
- **Win Rate**: % of profitable trades
- **Account Overview**: Balance, exposure, margin
- **Trade Statistics**: Total trades, wins, losses

---

## Getting Started

### Step 1: Access Trading Dashboard
Navigate to: `http://localhost:3000/en/trading`

### Step 2: Check WebSocket Connection
Look for the green 🟢 indicator in the Quick Trade Panel. If yellow 🟡, the system is reconnecting.

### Step 3: Place Your First Trade
1. Select a symbol (BTC, ETH, SOL, BNB)
2. Enter quantity (e.g., 0.001 BTC)
3. Review estimated cost
4. Click **Buy** or **Sell**
5. Wait for success notification

### Step 4: Monitor Positions
- View open positions in the **Live Position Tracker**
- Watch real-time PnL updates
- Close positions when desired

### Step 5: Review Performance
Navigate to `/trading/pnl` to see:
- Total realized/unrealized PnL
- Win rate and trade statistics
- Account exposure metrics

---

## Risk Management

### Automatic Checks
- **Max Leverage**: 10x
- **Max Exposure**: 80% of account balance
- **Margin Requirement**: 10% per position
- **Liquidation Warnings**: Color-coded risk levels

### Risk Levels
- **LOW**: < 30% exposure (green)
- **MEDIUM**: 30-50% exposure (yellow)
- **HIGH**: 50-70% exposure (orange)
- **CRITICAL**: > 70% exposure (red)

### Order Rejection Reasons
1. **Insufficient Balance**: Not enough USDT
2. **Risk Limit**: Exposure would exceed 80%
3. **Over-Leveraged**: Leverage > 10x
4. **Negative Margin**: Margin available < 0

---

## Trading Modes

### Paper Trading (Current)
- **No Real Money**: All trades simulated
- **Live Prices**: Real market data from Binance
- **Risk-Free**: Learn without financial loss
- **Full Features**: Same UI/UX as live trading

### Live Trading (Future)
- **Real Execution**: Orders sent to exchange
- **API Keys Required**: Binance API credentials
- **Real Money**: Actual USDT used
- **Same Risk Limits**: 10x leverage, 80% exposure

---

## Guardian Agent Monitoring

### Whale Trade Detection
- **Threshold**: > $10,000 USDT per trade
- **Alert**: Logged to `/admin/security/alerts`
- **Action**: Manual review recommended

### HFT Pattern Detection
- **Threshold**: > 10 trades in 60 seconds
- **Alert**: Logged to security alerts
- **Action**: Automatic user notification

---

## Pages Reference

| Page | URL | Purpose |
|------|-----|---------|
| Trading Dashboard | `/trading` | Quick trade + positions |
| Position Tracker | `/trading/positions` | Open positions only |
| PnL Dashboard | `/trading/pnl` | Performance metrics |
| Admin Monitor | `/admin/trading` | All user activity |
| Agent Status | `/admin/agents` | Guardian/Auditor health |

---

## Troubleshooting

### WebSocket Not Connecting
```bash
# Start WebSocket server manually
npx ts-node backend/websocket/server.ts
```

### No Price Updates
```bash
# Start Price Feed service
npx ts-node backend/services/price-feed.ts
```

### Orders Failing
1. Check wallet balance: Must have USDT
2. Check risk limits: Exposure < 80%
3. Check position count: Guardian monitors high volume
4. Review error message in UI

### Position PnL Not Updating
1. Verify WebSocket connection (🟢 green)
2. Check browser console for errors
3. Refresh page to reconnect
4. Verify Price Feed is running

---

## API Endpoints

### Place Order
```
POST /api/v1/trading/orders
Body: {
  userId: string,
  symbol: string,
  side: 'BUY' | 'SELL',
  quantity: number,
  type: 'MARKET'
}
```

### Get Positions
```
GET /api/v1/trading/positions?userId={id}&status=OPEN
```

### Close Position
```
POST /api/v1/trading/positions
Body: {
  positionId: string,
  userId: string
}
```

---

## Best Practices

1. **Start Small**: Test with 0.001 BTC first
2. **Monitor Exposure**: Keep below 50% for safety
3. **Set Targets**: Know your entry/exit before trading
4. **Use Stop Loss**: Close losing positions early
5. **Review PnL**: Analyze performance weekly

---

## Support

For issues or questions:
1. Check browser console for errors
2. Review `/admin/security/alerts` for Guardian warnings
3. Verify all services are running (WebSocket, Price Feed, Guardian)
4. Check `task.md` for system status

---

**Version**: Phase 3 - Trading Engine Core  
**Last Updated**: 2025-11-24  
**Mode**: Paper Trading
