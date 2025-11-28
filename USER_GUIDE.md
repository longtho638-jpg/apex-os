# ApexOS User Guide

**Version:** 1.0.0  
**Last Updated:** 2025-11-19

---

## 🌟 Welcome to ApexOS

ApexOS is an intelligent trading operations system powered by AI agents. This guide will help you get started and understand all features.

---

## 📖 Table of Contents

1. [Quick Start](#quick-start)
2. [Dashboard Overview](#dashboard-overview)
3. [Trading Terminal](#trading-terminal)
4. [Admin Console](#admin-console)
5. [Understanding Your Data](#understanding-your-data)
6. [AI Agents Explained](#ai-agents-explained)
7. [FAQ](#faq)

---

## 🚀 Quick Start

### Step 1: Access ApexOS

Open your browser and navigate to:
```
http://localhost:3000/dashboard
```

### Step 2: Connect Your Exchange

1. Click **"Connect Exchange"** button
2. Select your exchange (Binance, Bybit, or OKX)
3. Enter your **Read-Only** API credentials
4. Click **"Connect"**

**⚠️ Security Note:** ApexOS only requires READ access. Never give TRADE permissions.

### Step 3: Wait for Sync

The system will automatically:
- Fetch your trade history
- Calculate your PnL
- Analyze fee rebates
- Check risk levels

This takes 1-3 minutes for the first sync.

---

## 📊 Dashboard Overview

### Key Metrics

#### 1. **Total PnL (30 Days)**
- Shows your profit/loss over the last 30 days
- Green = Profitable, Red = Loss
- Includes all fees deducted

**Example:**
```
Total PnL: +$4,291.00
Win Rate: 62.5%
```

#### 2. **Rebates Earned**
- Money returned to you from exchange fees
- ApexOS negotiates better rates for you
- Auto-calculated monthly

**How it works:**
```
You pay $1,000 in fees
Exchange gives Apex $200 commission
You get back $170 (85%)
Apex keeps $30 (15%)
```

#### 3. **Risk Score**
- **Low:** Safe, no liquidation risk
- **Medium:** Monitor positions
- **High:** Reduce leverage immediately

**Powered by:** The Guardian Agent (AI risk manager)

---

## 💹 Trading Terminal

### Real-Time Market Watch

Shows live prices from Binance for:
- BTC/USDT
- ETH/USDT
- SOL/USDT
- BNB/USDT
- And more...

**Features:**
- ✅ Live price updates (WebSocket)
- ✅ 24h price change %
- ✅ Click to select market

### Agentic Insights

Three AI-powered alerts:

#### 1. Fee Forecast
- Predicts your funding costs
- Alerts when rates spike
- Recommends position adjustments

#### 2. Volatility Scanner
- Detects high-risk market conditions
- Warns about slippage
- Suggests limit orders vs market orders

#### 3. Trade Setup Rating
- AI confidence score
- Bullish/Bearish/Neutral sentiment
- Based on multiple indicators

### Portfolio Health Check

Real-time view of:
- Current positions
- Unrealized PnL
- Fee impact this month
- AI optimization suggestions

---

## 🛡️ Admin Console

**Access:** http://localhost:3000/admin  
**Password:** `admin123` (change in production!)

### Tabs

#### 1. User Management
- View all users
- Check trading volumes
- Ban suspicious accounts

#### 2. Financial Reconciliation
- Total fees collected
- Rebates distributed
- Apex profit margins
- Payout processing

#### 3. System Health
- API uptime
- Error rates
- Active connections
- Real-time agent logs

---

## 📈 Understanding Your Data

### PnL Calculation

ApexOS uses **FIFO (First-In, First-Out)** method:

**Example:**
```
Buy 1 BTC @ $40,000
Buy 1 BTC @ $42,000
Sell 2 BTC @ $45,000

PnL Calculation:
First BTC: ($45,000 - $40,000) - fees = $4,960
Second BTC: ($45,000 - $42,000) - fees = $2,960
Total PnL: $7,920
```

### Fee Types

1. **Trading Fees**
   - Maker: 0.02% (when you place limit orders)
   - Taker: 0.04% (when you take existing orders)

2. **Funding Fees**
   - Paid every 8 hours on perpetual futures
   - Positive rate = Shorts pay Longs
   - Negative rate = Longs pay Shorts

3. **Rebate**
   - Your share of exchange commissions
   - Calculated monthly
   - Paid automatically

---

## 🤖 AI Agents Explained

### 1. The Collector
**Role:** Data gatherer  
**Tasks:**
- Fetches BTC/crypto prices
- Syncs your trades from exchanges
- Updates portfolio snapshots

**Status:** Always running

---

### 2. The Auditor
**Role:** Fee accountant  
**Tasks:**
- Reconciles fees (checks for overcharges)
- Calculates your rebates
- Generates tax reports

**Accuracy:** ±0.01 USD

---

### 3. The Guardian
**Role:** Risk manager  
**Tasks:**
- Monitors liquidation prices
- Alerts on over-leverage
- Tracks funding rate costs

**Alert Levels:**
- 🟢 **Safe:** No action needed
- 🟡 **Warning:** Monitor closely
- 🔴 **Critical:** Reduce positions NOW

---

### 4. The Concierge (Coming Soon)
**Role:** AI assistant  
**Tasks:**
- Answer your trading questions
- Explain PnL calculations
- Suggest optimizations

---

## ❓ FAQ

### Q: Why is my PnL negative?
**A:** Check:
1. Are you including fees in calculation?
2. Did you have losing trades?
3. High funding rate costs?

Use the Auditor tab to see detailed breakdown.

---

### Q: How are rebates calculated?
**A:** 
```
Your Fees × Exchange Commission Rate × Your Share
Example: $1,000 × 20% × 85% = $170 rebate
```

---

### Q: Is my data secure?
**A:**
✅ API keys encrypted with AES-256  
✅ Read-only access (no trading)  
✅ RLS (Row-Level Security) on database  
✅ All data stored in Supabase (SOC 2 compliant)

---

### Q: What happens if I disconnect exchange?
**A:** Historical data remains. New trades won't sync.

---

### Q: Can I export my data?
**A:** Yes! Tax Report (CSV) available in Auditor tab.

---

## 🆘 Support

**Issues?**
- Check [API Documentation](./API_DOCUMENTATION.md)
- Review logs in Admin Console
- Contact: support@apexos.dev

---

## 📝 Changelog

**v1.0.0 (2025-11-19)**
- ✅ PnL Calculator (FIFO method)
- ✅ Fee Auditor
- ✅ Risk Guardian
- ✅ Real-time market data
- ✅ Rebate tracking

---

**Made with ❤️ by ApexOS Team**
