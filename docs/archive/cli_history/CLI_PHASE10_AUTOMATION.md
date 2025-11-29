# CLI PHASE 10: AUTOMATION EMPIRE (ĐẾ CHẾ TỰ ĐỘNG)

## Strategic Context: 兵貴神速 (Speed is Precious in War)

**Sun Tzu Principle**: "Speed is the essence of war. Take advantage of the enemy's unpreparedness; travel by unexpected routes and strike him where he has taken no precautions."

**Application**: Speed in business is Automation. We scale without hiring by letting AI handle the heavy lifting of Content, Support, and Sales.

**Objective**: Scale to $1M ARR with 0 headcount increase.
**Timeline**: Week 4 (2-3 days CLI execution)

---

## TASK 1: AUTO-CONTENT GENERATOR (SEO ENGINE)

### 1.1 Market Analysis Cron Job
**File**: `src/app/api/cron/market-analysis/route.ts` (NEW)

**Logic**:
1. Fetch top 5 crypto prices & 24h change (Binance API/Coingecko).
2. Use DeepSeek via OpenRouter to generate a "Daily Market Snapshot".
3. Format as a Blog Post (Markdown).
4. Save to `blog_posts` table with status `published`.

**Prompt**:
"Write a professional crypto market analysis for today. BTC is at [price], ETH at [price]. Highlight major movers. Tone: Expert, institutional. Structure: 1. Market Overview, 2. Key Levels, 3. Outlook. SEO Keywords: Bitcoin analysis, Crypto daily update."

### 1.2 Blog Integration
Ensure `src/app/[locale]/blog/page.tsx` displays these auto-generated posts correctly (already set up in Phase 5, verify integration).

---

## TASK 2: AI SUPPORT AGENT (CSKH)

### 2.1 Support Chat Interface
**File**: `src/components/support/SupportChat.tsx` (NEW)

**Features**:
- Floating chat bubble (bottom right).
- Opens chat window.
- Pre-canned FAQs.
- AI input field.

### 2.2 Support API Route
**File**: `src/app/api/ai/support/route.ts` (NEW)

**Logic**:
- Accept user query.
- Context: ApexOS features, Pricing Tiers, How to connect API keys.
- Use DeepSeek/Claude Haiku (Fast & Cheap).
- Output concise answers.

**System Prompt**:
"You are the ApexOS Support Bot. Help users with:
1. Pricing (Pro $29, Trader $97).
2. Features (AI Signals, Copy Trading).
3. Technical issues (API Keys, etc.).
Be helpful, concise, and professional. If unsure, ask them to email support@apexos.com."

---

## TASK 3: SMART UPSELL TRIGGERS (SALES TỰ ĐỘNG)

### 3.1 Win Streak Upsell
**File**: `src/components/upsell/WinStreakPopup.tsx` (NEW)

**Trigger**:
- User (Free/Pro) hits 3 winning trades in a row OR >$500 profit.
- Show modal: "🔥 You're on fire! Lock in these gains with the TRADER tier (Auto-Trading & Advanced Risk Management)."

### 3.2 Tenure Upsell (Annual Plan)
**File**: `src/app/api/cron/upsell-tenure/route.ts` (NEW)

**Logic**:
- Find users active > 30 days on Monthly plan.
- Send email / In-app notification: "You've been with us for a month! Switch to Annual and save 17% instantly."

### 3.3 Implementation in Dashboard
**File**: `src/app/[locale]/dashboard/layout.tsx` (MODIFY)
- Inject `WinStreakPopup` and `SupportChat` globally in the dashboard layout.

---

## DELIVERABLES

1. ✅ **SEO Engine**: Daily market analysis automated.
2. ✅ **Support Bot**: 24/7 AI answering queries.
3. ✅ **Sales Bot**: Context-aware upsells based on user success.

---

## EXECUTION COMMAND

```bash
Execute PHASE 10 (Automation Empire)

Implement:
1. Auto-Content Generator (Cron + DeepSeek)
2. AI Support Agent (UI + API)
3. Smart Upsell Triggers (Win Streak Popup + Tenure Cron)

Quality:
- TypeScript strict mode
- 0 technical debt
- Mobile responsive
- Build: 0 errors
```
