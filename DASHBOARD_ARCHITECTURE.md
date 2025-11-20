# ApexOS - Dashboard Architecture (Free vs Founders vs Admin)

## 🎯 Core Principle

**"User thấy user, $99 thấy $99, Admin thấy Admin"**

Mỗi tier chỉ thấy features họ có quyền. Không show menu trống → Tạo FOMO muốn upgrade.

---

## 📊 Navigation Menu Comparison

| Menu Item | Free | Founders ($99) | Admin |
|-----------|------|----------------|-------|
| **📊 Overview** | ✅ Basic stats | ✅ Real-time | ✅ System-wide |
| **💰 PnL Tracker** | ✅ 30-day manual | ✅ Lifetime auto | ✅ All users |
| **🤖 Wolf Pack** | ❌ Hidden | ✅ Full control | ✅ Monitor all |
| **🔍 Fee Audit** | ❌ Hidden | ✅ AI-powered | ✅ System recon |
| **🛡️ Guardian** | ❌ Hidden | ✅ 24/7 alerts | ✅ All risks |
| **👥 Referrals** | ⚠️ Teaser (0%) | ✅ Active (20%) | ✅ Manage |
| **📑 Reports** | ✅ CSV only | ✅ PDF/Excel/Tax | ✅ Analytics |
| **💳 Billing** | ❌ Hidden | ✅ History | ✅ Revenue |
| **📚 Resources** | ✅ Basic | ✅ Marketing kit | ✅ Internal |
| **⚙️ Settings** | ✅ Basic | ✅ Advanced | ✅ System |
| **🔧 Admin** | ❌ Hidden | ❌ Hidden | ✅ Full access |

---

## 🎨 Detailed Section Designs

### 1. OVERVIEW

#### Free Tier
```
┌─ Welcome Banner ────────────────────┐
│ Welcome, John Doe (Free Tier)       │
│ 🎁 Unlock Wolf Pack for $99         │
│ [Upgrade Now →] (13/100 spots left) │
└─────────────────────────────────────┘

┌─ Quick Stats (Last 30 Days) ────────┐
│ Total PnL    Trades    Fees Paid    │
│ +$1,240      87        $124         │
└─────────────────────────────────────┘

┌─ 🔒 Locked Features ─────────────────┐
│ ⚡ Real-time PnL Auto-Sync           │
│ 🤖 AI Fee Auditor (Save est. $47/mo)│
│ 🛡️ 24/7 Risk Guardian Alerts        │
│ 👥 20% Referral Commission          │
│                                     │
│ [See What You're Missing →]        │
└─────────────────────────────────────┘

┌─ Recent Trades ─────────────────────┐
│ 2024-11-19  BTC/USDT  +$24         │
│ 2024-11-18  ETH/USDT  -$12         │
│ ... (showing 5 of 87)               │
│                                     │
│ 🔒 82 more trades hidden            │
│ [Upgrade to view all →]            │
└─────────────────────────────────────┘
```

#### Founders Tier
```
┌─ Welcome Banner ────────────────────┐
│ Welcome, John Doe 👑 Founders #88   │
│ ✨ Lifetime Member since Nov 15     │
│ [Refer & Earn →]                    │
└─────────────────────────────────────┘

┌─ Real-Time Stats (All-Time) ────────┐
│ Total PnL  Trades  Fees Paid  Saved │
│ +$12,450   1,247   $1,240    +$486  │
└─────────────────────────────────────┘

┌─ 🤖 Wolf Pack Status (Live) ────────┐
│ ✅ Collector  | Synced 2 min ago    │
│ ⚠️ Auditor   | Found $24 discrepancy│
│ 🟡 Guardian  | 1 position at risk   │
│ ✅ Concierge | Ready                │
│ [View Details →]                    │
└─────────────────────────────────────┘

┌─ 💰 Referral Earnings ──────────────┐
│ Active Refs: 3  |  Monthly: $47    │
│ [Dashboard →] [Share Link]          │
└─────────────────────────────────────┘

┌─ Detailed Trades (Paginated) ───────┐
│ 2024-11-19 14:23  BTC/USDT          │
│ Entry: $42,150  Exit: $42,380       │
│ PnL: +$24  Fee: $2.10  Rebate: $0.42│
│ [Details →]                         │
│ ─────────────────────────────────── │
│ ... 9 more                          │
│ Page 1/125  [Next →]                │
└─────────────────────────────────────┘
```

### 2. PNL TRACKER

#### Free
- Manual "Sync Trades" button
- Last 30 days ONLY
- Basic table (Symbol, PnL, Fee)
- CSV export
- No charts

```
💰 PnL Tracker (Last 30 Days)

[Sync Trades] (Manual refresh required)

┌─────────────────────────────────────┐
│ Date       Symbol    PnL      Fee   │
│ 11-19      BTC       +$24     $2.10 │
│ 11-18      ETH       -$12     $1.80 │
│ ...                                 │
│ (30-day limit)                      │
│                                     │
│ 🔒 Lifetime history locked          │
│ [Upgrade to unlock →]              │
└─────────────────────────────────────┘

[Export CSV (30 days)]
```

#### Founders
- Auto-sync every 5 min
- Lifetime history
- Advanced filters
- Charts (Daily/Weekly/Monthly)
- PDF/Excel/Tax export

```
💰 PnL Tracker (All-Time)

⚡ Auto-syncing... Last: 2 min ago

┌─ Filters ───────────────────────────┐
│ Date: [All Time ▼]                  │
│ Symbol: [All ▼]  PnL: [All ▼]      │
│ [Apply Filters]                     │
└─────────────────────────────────────┘

┌─ Chart View ────────────────────────┐
│     ┌───┐                           │
│  ┌──┤   ├───┐                       │
│  │  └───┘   │                       │
│ ─┴──────────┴─────────────────      │
│  Oct    Nov    Dec                  │
│ [Daily] [Weekly] [Monthly]          │
└─────────────────────────────────────┘

┌─ Detailed Table (Paginated) ────────┐
│ Date      Symbol  Side  Entry  Exit │
│ 11-19     BTC     Long  42150  42380│
│ 14:23                                │
│ Qty: 0.5  Lev: 5x  PnL: +$24        │
│ Fee: $2.10  Rebate: $0.42           │
│ [View Full Details →]               │
│ ─────────────────────────────────── │
│ Page 1/125  [1][2][3]...[Next →]   │
└─────────────────────────────────────┘

[Export PDF] [Export Excel] [Tax Report]
```

### 3. WOLF PACK (Founders Only)

Hidden completely from Free users.

```
🤖 The Wolf Pack Control Center

┌─ The Collector ─────────────────────┐
│ Status: ✅ Active (Running)         │
│ Last Sync: 2 minutes ago            │
│ Today: 24 trades collected          │
│ Exchanges: Binance (✅), Bybit (✅) │
│                                     │
│ [View Activity Log] [Settings]      │
└─────────────────────────────────────┘

┌─ The Auditor ───────────────────────┐
│ Status: ✅ Active (Scanning)        │
│ Last Audit: 1 hour ago              │
│                                     │
│ ⚠️ Fee Discrepancy Found!           │
│ Trade #4783 (BTC/USDT)              │
│ Expected: $42.10                    │
│ Charged: $66.60                     │
│ Overcharge: $24.50 (58%)            │
│                                     │
│ Action: Rebate claim filed          │
│ ETA: 3-5 business days              │
│                                     │
│ [View Audit Report →]               │
└─────────────────────────────────────┘

┌─ The Guardian ──────────────────────┐
│ Status: ⚠️ Alert (1 position)       │
│                                     │
│ Position: BTC/USDT Long 5x          │
│ Entry: $42,150                      │
│ Current: $42,380 (+0.54%)           │
│ Liquidation: $33,720                │
│ Distance: 20.4% (Safe)              │
│                                     │
│ Funding Rate: -0.015% (High cost)   │
│ Daily Cost: ~$3.15                  │
│                                     │
│ [Adjust Leverage] [Close Position]  │
└─────────────────────────────────────┘

┌─ The Concierge ─────────────────────┐
│ Status: ✅ Ready                    │
│                                     │
│ 💬 Recent Conversation:             │
│ You: "Show best trades this month"  │
│ Bot: "Your top 3 were..."           │
│                                     │
│ Ask me anything:                    │
│ [________________________________]  │
│ [Send]                              │
│                                     │
│ Suggestions:                        │
│ • "Generate tax report 2024"        │
│ • "What's my avg win rate?"         │
│ • "Show BTC performance"            │
└─────────────────────────────────────┘
```

**Agent Activity Logs (Click to expand):**
```
┌─ The Collector - Activity Log ──────┐
│ [2024-11-19 14:23:12]               │
│ → Connected to Binance WebSocket    │
│                                     │
│ [2024-11-19 14:23:45]               │
│ → Received trade #4783 (BTC/USDT)   │
│   Stored in database                │
│                                     │
│ [2024-11-19 14:30:01]               │
│ → Sync completed: 24 new trades     │
│                                     │
│ [Show All Logs →]                   │
└─────────────────────────────────────┘
```

### 4. REFERRALS

#### Free (Teaser)
```
💰 Referral Program (Preview)

┌─────────────────────────────────────┐
│ 🔒 Earn 20% passive income          │
│                                     │
│ Upgrade to Founders to unlock:      │
│ • Unique referral link              │
│ • 20% of all fees from your refs    │
│ • Lifetime passive earnings         │
│                                     │
│ Example Scenario:                   │
│ You refer 5 traders                 │
│ Avg volume: $500k/month             │
│ → Your monthly passive: ~$125       │
│                                     │
│ [Unlock for $99 →]                 │
└─────────────────────────────────────┘
```

#### Founders (Full Dashboard)
```
💰 Referral Dashboard

┌─ Performance ───────────────────────┐
│ Referrals    Active Vol    Monthly  │
│ 3            $1.2M         +$47     │
└─────────────────────────────────────┘

┌─ Your Link ─────────────────────────┐
│ https://apex.os/r/abc123            │
│ [Copy] [QR Code] [Share Kit]        │
└─────────────────────────────────────┘

┌─ Referral Details ──────────────────┐
│ User A (Whale) - Joined Oct 15      │
│ Monthly Vol: $800k  |  You: $32/mo  │
│ ─────────────────────────────────── │
│ User B (Active) - Joined Nov 1      │
│ Monthly Vol: $350k  |  You: $14/mo  │
│ ─────────────────────────────────── │
│ User C (New) - Joined Nov 18        │
│ Monthly Vol: $50k   |  You: $1/mo   │
└─────────────────────────────────────┘

┌─ Earnings History (Paginated) ──────┐
│ Nov 2024: $47  (3 refs)             │
│ Oct 2024: $32  (2 refs)             │
│ Sep 2024: $0   (joined)             │
│ Page 1/3  [Next →]                  │
└─────────────────────────────────────┘

┌─ 📚 Marketing Toolkit ───────────────┐
│ Copy-paste content ready to share:  │
│                                     │
│ 📱 Social Media Posts (X, LinkedIn) │
│ 📧 Email Templates                  │
│ 🎨 Visual Assets (Banners, QR)     │
│ 📹 Video Scripts                    │
│                                     │
│ [Download Full Kit →]              │
└─────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### Database Schema Updates

```sql
-- Add subscription tier
ALTER TABLE users 
  ADD COLUMN subscription_tier VARCHAR(20) DEFAULT 'free',
  ADD COLUMN joined_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN founders_slot INT;

-- Referral tracking
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES users(id),
  referee_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active',
  UNIQUE(referee_id)
);

-- Referral earnings
CREATE TABLE referral_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES users(id),
  referee_id UUID REFERENCES users(id),
  month VARCHAR(7), -- '2024-11'
  amount DECIMAL(10,2),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Feature Gate Hook

```typescript
// src/hooks/useUserTier.ts
export function useUserTier() {
  const { user } = useAuth();
  const [tier, setTier] = useState<Tier>('free');
  const [slot, setSlot] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    
    fetch(`/api/v1/user/tier`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(res => res.json())
    .then(data => {
      setTier(data.tier);
      setSlot(data.slot);
    });
  }, [user]);

  return {
    tier,
    slot,
    isFounders: tier === 'founders',
    isAdmin: tier === 'admin',
    isFree: tier === 'free',
    
    canViewMenu: (menu: MenuId) => {
      // Define menu access rules
      const access = {
        overview: ['free', 'founders', 'admin'],
        pnl: ['free', 'founders', 'admin'],
        wolfpack: ['founders', 'admin'],
        audit: ['founders', 'admin'],
        guardian: ['founders', 'admin'],
        referrals: ['free', 'founders', 'admin'],
        reports: ['free', 'founders', 'admin'],
        billing: ['founders', 'admin'],
        resources: ['free', 'founders', 'admin'],
        settings: ['free', 'founders', 'admin'],
        admin: ['admin']
      };
      
      return access[menu]?.includes(tier) ?? false;
    }
  };
}
```

### API Endpoints

1. GET /api/v1/user/tier
2. GET /api/v1/referrals/stats
3. GET /api/v1/referrals/earnings
4. POST /api/v1/referrals/generate-link

---

## 📄 Pagination Strategy

Free: Max 30 items, no pagination
Founders: Unlimited, paginated by 50

```typescript
function usePagination(tier: Tier) {
  const [page, setPage] = useState(1);
  const limit = tier === 'free' ? 30 : 50;
  
  return { page, setPage, limit };
}
```

---

## ✅ Implementation Checklist

- [ ] Update database schema
- [ ] Build useUserTier() hook
- [ ] Refactor Sidebar with tier gates
- [ ] Rebuild Overview page (3 versions)
- [ ] Rebuild PnL page (2 versions)
- [ ] Build Wolf Pack page (Founders only)
- [ ] Build Referral dashboard
- [ ] Build Marketing toolkit
- [ ] Add upgrade CTAs everywhere
- [ ] Test tier transitions
- [ ] Deploy

---

*Complete specification ready for implementation.*
