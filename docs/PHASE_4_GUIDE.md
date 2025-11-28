# Phase 4: Advanced Trading Features - User Guide

## Overview

Phase 4 adds institutional-grade trading features including limit orders, automated risk management, copy trading, and ML-powered trading signals.

---

## 4.1 Limit Orders

### What are Limit Orders?

Limit orders let you buy or sell at a specific price rather than the current market price.

### How to Use

1. Navigate to `/trading/limit-orders`
2. Select your trading symbol
3. Enter your desired limit price
4. Enter quantity
5. Click "Buy Limit" or "Sell Limit"

### Features

- **Price Distance**: Shows how far your limit price is from current market price
- **Pending Orders**: View all open limit orders
- **Auto-Execution**: Orders automatically execute when market reaches your price
- **Quick Cancel**: Cancel any pending order with one click

### Example

```
Current BTC Price: $45,000
Your Limit Buy Order: $44,000 (-2.22% from market)
→ Order executes automatically when BTC drops to $44,000
```

---

## 4.2 Stop Loss / Take Profit (SL/TP)

### What is SL/TP?

Automated position management that closes your trades at predetermined profit/loss levels.

### How to Set SL/TP

1. Open the `/trading/positions` page
2. Click "SL/TP" button on any position
3. Enter Stop Loss price (below entry for LONG, above for SHORT)
4. Enter Take Profit price (above entry for LONG, below for SHORT)
5. Click "Set"

### Automation Rules

**Stop Loss**: Automatically close position to limit losses
- LONG positions: Triggers when price ≤ stop price
- SHORT positions: Triggers when price ≥ stop price

**Take Profit**: Automatically close position to lock in profits
- LONG positions: Triggers when price ≥ target price
- SHORT positions: Triggers when price ≤ target price

**Trailing Stop**: Advanced feature that follows price with a percentage gap
- Updates stop price as market moves in your favor
- Locks in profits while allowing upside

### Example

```
Position: LONG BTC @ $45,000
Stop Loss: $44,000 (-2.22%)
Take Profit: $47,000 (+4.44%)

→ Position automatically closes at $44,000 loss OR $47,000 profit
```

---

## 4.3 Copy Trading

### What is Copy Trading?

Automatically replicate trades from successful traders (leaders) to your account.

### How to Follow a Leader

1. Go to `/copy-trading`
2. Browse the leaderboard
3. Review leader stats (PnL, Win Rate, Followers)
4. Click "Follow" on your chosen leader
5. Configure copy ratio (1.0 = same size, 0.5 = half size)

### Leader Stats

- **Total PnL**: Cumulative profit/loss
- **Win Rate**: Percentage of profitable trades
- **Total Trades**: Number of executed trades
- **Followers**: Current follower count

### How It Works

When a leader places a trade:
1. System detects the trade
2. Automatically replicates to all followers
3. Adjusts quantity by your copy ratio
4. Respects your max copy amount setting

### Example

```
Leader trades: BUY 1.0 BTC @ $45,000
Your copy ratio: 0.5
Your max amount: $30,000

→ You automatically buy 0.5 BTC @ $45,000 ($22,500 - within limit)
```

---

## 4.4 ML Trading Signals

### What are Trading Signals?

AI-generated buy/sell recommendations based on technical indicators (RSI, MACD).

### How to Use Signals

1. Navigate to `/signals`
2. Click "Refresh" to generate latest signals
3. Review signal type (BUY/SELL/HOLD)
4. Check confidence score (0-100%)
5. Review reason and indicators

### Signal Indicators

**RSI (Relative Strength Index)**
- < 30: Oversold (potential BUY)
- \> 70: Overbought (potential SELL)
- 30-70: Neutral

**MACD (Moving Average Convergence Divergence)**
- Bullish crossover: MACD > Signal (potential BUY)
- Bearish crossover: MACD < Signal (potential SELL)

### Confidence Levels

- **80-100%**: High confidence (both indicators agree)
- **60-79%**: Medium confidence (one strong signal)
- **0-59%**: Low confidence (conflicting or weak signals)

### Example Signal

```
BTC/USDT: BUY
Confidence: 85%
Reason: RSI oversold (28.4), MACD bullish crossover
RSI: 28.4
MACD Histogram: +0.15
```

### ⚠️ Important Disclaimer

Signals are for informational purposes only. They are NOT financial advice. Always:
- Do your own research
- Consider market conditions
- Use proper risk management
- Never invest more than you can afford to lose

---

## Best Practices

### 1. Always Use Stop Losses
Set SL on every position to limit potential losses.

### 2. Don't Over-Leverage
Higher leverage = higher risk. Start with 1-2x.

### 3. Diversify Copy Trading
Don't follow just one leader. Spread risk across multiple.

### 4. Verify Signals
Don't blindly follow ML signals. Check chart and news.

### 5. Start Small
Test features with small amounts before scaling up.

---

## Troubleshooting

### Limit Order Not Executing
- Check if price has reached your limit
- Verify order status in pending orders list
- Ensure sufficient balance

### SL/TP Not Triggering
- Confirm automation rules are "ACTIVE"
- Check trigger prices are correct
- Verify position is still open

### Copy Trade Not Replicating
- Ensure you're following the leader
- Check copy ratio and max amount settings
- Verify leader has made a trade

### Signals Not Generating
- Ensure sufficient price history (50+ data points)
- Try different symbols
- Check API endpoint is running

---

## API Endpoints

### Limit Orders
- POST `/api/v1/trading/limit-orders` - Place limit order
- GET `/api/v1/trading/limit-orders?userId=X` - Get user's orders
- DELETE `/api/v1/trading/limit-orders` - Cancel order

### Automation (SL/TP)
- POST `/api/v1/trading/automation` - Set SL/TP
- GET `/api/v1/trading/automation?positionId=X` - Get position rules
- DELETE `/api/v1/trading/automation` - Cancel rule

### Copy Trading
- GET `/api/v1/trading/copy-trading?action=leaders` - List leaders
- POST `/api/v1/trading/copy-trading` - Follow/register
- DELETE `/api/v1/trading/copy-trading` - Unfollow

### Signals
- GET `/api/v1/trading/signals?action=generate&symbols=X` - Generate signals

---

## Support

For issues or questions:
1. Check logs in Guardian Agent dashboard
2. Review API documentation
3. Contact support team

---

**Built with ❤️ following .claude zero-debt methodology**
