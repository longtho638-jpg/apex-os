# CRM & Email "Beehive" Architecture (The Art of War)

## 1. The Philosophy: "The Beehive" (TỔ ONG)
In Sun Tzu's Art of War, **Foreknowledge (用間)** is the key to victory. We cannot rely on guesswork. We must know every move of the "enemy" (user) to convert them into an ally (customer).

The **Beehive** represents our Central ERP (Admin Panel).
*   **The Queen**: The Admin/System (You).
*   **The Bees**: The Users (Workers/Soldiers).
*   **The Honey**: Data/Revenue.
*   **The Cells**: The 30 Strategic Phases (Touchpoints).

Every flight (user session), every flower visited (page view), and every drop of nectar (action) must be tracked and stored in the Hive.

## 2. Salesforce-Grade Pipeline (The Funnel)
We map the User Journey to a strict Sales Pipeline.

| Stage | Sun Tzu Phase | User State | Trigger | Email/Action | CRM Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Scout** | Phase 2 (Spies) | Visitor | Visits Landing Page | Pixel Track | `LEAD_NEW` |
| **2. Infiltrator** | Phase 7 (Defense) | Sign Up | Submit Form | Welcome Email (Branded) | `LEAD_QUALIFIED` |
| **3. Soldier** | Phase 15 (Sim) | Paper Trade | Execute Trade | "First Blood" Email | `OPPORTUNITY_ACTIVE` |
| **4. Commander** | Phase 4 (Speed) | Deposit | Add Funds | "War Chest" Email | `CUSTOMER_PAID` |
| **5. General** | Phase 19 (Wolf) | Copy Trading | Follow Master | "Alliance Formed" Email | `CUSTOMER_VIP` |
| **6. Emperor** | Phase 28 (Divide) | White Label | B2B Inquiry | "Empire Builder" Email | `PARTNER_B2B` |
| **7. Deserter** | Phase 20 (Retreat) | Inactive 7d | No Login | "Win Back" Email (50% Off) | `CHURN_RISK` |

## 3. Technical Architecture (Zero Tech Debt)

### A. Database Schema (Supabase)
We need a robust schema to track this "Beehive".

```sql
-- The Honeycomb Cells (Events)
create table crm_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  event_type text not null, -- 'PAGE_VIEW', 'CLICK', 'EMAIL_OPEN', 'TRADE', 'DEPOSIT'
  metadata jsonb default '{}',
  severity text default 'INFO', -- 'INFO', 'WARN', 'SUCCESS', 'CRITICAL'
  created_at timestamptz default now()
);

-- The Pipeline (Status)
create table crm_pipelines (
  user_id uuid primary key references auth.users(id),
  stage text not null default 'LEAD_NEW',
  score int default 0, -- Lead Scoring (0-100)
  last_interaction timestamptz default now(),
  tags text[] default '{}'
);

-- Email Logs (Communication)
create table email_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  template_id text not null,
  status text not null, -- 'SENT', 'OPENED', 'CLICKED', 'BOUNCED'
  sent_at timestamptz default now()
);
```

### B. The "Deep Scan" Logic (Middleware/Hooks)
1.  **Middleware**: Tracks `PAGE_VIEW` events automatically.
2.  **Server Actions**: Wraps every critical action (`signUp`, `deposit`, `trade`) with a `CRM.track()` call.
3.  **Email Service**: Wraps `Resend` to log `EMAIL_SENT` events automatically.

### C. The ERP Dashboard (Admin View)
A "God View" in `/admin/crm` that visualizes the Beehive.
*   **Heatmap**: Where are users clustering? (Which Phase?)
*   **Flow**: Where do they drop off? (Funnel Analysis)
*   **Individual**: "Deep Dive" into a single user's timeline.

## 4. Implementation Plan (10x Thinking)
1.  **Database**: Create the tables.
2.  **Service**: Build `CRMService` (Singleton).
3.  **Integration**:
    *   Hook into `auth/callback` (Sign Up).
    *   Hook into `trading/execute` (Trade).
    *   Hook into `finance/deposit` (Deposit).
    *   Hook into `email-service` (Communication).
4.  **UI**: Build the `/admin/crm` dashboard.

This ensures **Total Information Awareness**. No user moves without the Hive knowing.

## 4. The 30-Phase Beehive Mapping (Deep Scan Strategy)
This section maps the 30 Strategic Phases to CRM Triggers and Email Pushes. The CRM acts as the "Dungeon Master", guiding users through the phases.

| Phase ID | Phase Name | CRM Trigger (User Action) | CRM Tag/Stage | Email Push (Automated) |
| :--- | :--- | :--- | :--- | :--- |
| **01** | **Foundation** | Sign Up & Verify Email | `STAGE: LEAD_NEW` | **Welcome Protocol** (Day 0) |
| **02** | **Email & SEO** | Opens 3+ Emails | `TAG: ENGAGED_READER` | **Intelligence Update** (Weekly) |
| **03** | **Analytics** | Visits `/analytics` > 2 times | `TAG: DATA_DRIVEN` | "Unlock Advanced Metrics" |
| **04** | **Payment** | Visits `/pricing` but abandons | `STAGE: LEAD_QUALIFIED` | **Trial Ending / Discount** |
| **06** | **Viral** | Refers 1 User | `TAG: INFLUENCER_LV1` | "Referral Success: You earned $X" |
| **07** | **Retention** | Inactive for 7 days | `STAGE: CHURN_RISK` | **WinBack: We Miss Your Edge** |
| **15** | **Simulation** | Executes 1st Paper Trade | `TAG: TRADER_ROOKIE` | "Paper Trading Report: Week 1" |
| **15** | **Simulation** | 10+ Paper Trades (Win Rate > 60%) | `STAGE: READY_FOR_CAPITAL` | "Upgrade to Live Trading" |
| **19** | **Social** | Follows a Trader | `TAG: SOCIAL_COPY` | "New Signal from [Trader]" |
| **22** | **AI Fund** | Deposits > $10k | `STAGE: CUSTOMER_VIP` | "Private Wealth Invitation" |
| **26** | **Launch** | Pre-registers for Event | `TAG: EARLY_ADOPTER` | "Launch Day Access Code" |
| **30** | **Singularity** | Connects API Key | `STAGE: POWER_USER` | "API Limit Increased" |

### The "Push" Logic (CRM Service)
The `CRMService` will monitor `crm_events` and automatically trigger these transitions.

```typescript
// Pseudo-code for Phase Trigger
async function checkPhaseTriggers(userId, event) {
  if (event.type === 'TRADE_EXECUTE' && event.metadata.mode === 'PAPER') {
    const tradeCount = await countTrades(userId);
    if (tradeCount === 1) {
      await emailService.send(userId, 'paper_trading_intro');
    } else if (tradeCount === 10 && winRate > 0.6) {
      await crm.updateStage(userId, 'READY_FOR_CAPITAL');
      await emailService.send(userId, 'upgrade_offer');
    }
  }
}
```

## 5. The $1M Algorithm (Super Sale Logic)
This is the "War Room" strategy to maximize revenue per user (ARPU) using Sun Tzu's principles.

### A. "Ghost Profit" (The FOMO Engine)
**Concept:** Show users exactly what they *lost* by not acting.
**Logic:**
1.  Track every signal generated by the AI.
2.  If user is FREE tier, calculate potential profit from that signal.
3.  Accumulate "Missed Profit" in `crm_pipelines.metadata.ghost_profit`.
4.  **Trigger:** When `ghost_profit > $500` -> Send "WinBack" email with exact dollar amount.

### B. "Sniper" Triggers (Behavioral Sales)
**Concept:** Strike when the user is most vulnerable/excited.
**Triggers:**
*   **The "Rage Quit" (Churn Risk):** User loses 3 trades in a row -> Send "Stop Loss Strategy" guide (Value Add) + "Get Pro Signals to Recover" (Upsell).
*   **The "Winning Streak" (Greed):** User wins 3 trades -> Send "Scale Up" offer (Yearly Plan).
*   **The "Window Shopper":** User visits `/pricing` 3 times in 24h -> Send "Secret 15% Off" (Expires in 1 hour).

### C. "General to Soldier" Communication
**Tone:** Direct, authoritative, military-grade. No fluff.
**Example:**
> "Soldier, you left $1,240 on the table this week. The market waits for no one. Re-arm yourself with Apex Pro."

### D. The "War Room" Dashboard
A dedicated view in `/admin/crm` to see:
*   **Total Ghost Profit:** How much money users are "losing" (Marketing Ammo).
*   **Conversion Probability:** AI score (0-100) of how likely a user is to buy.

## 6. The Beehive Philosophy (Tinh Hoa Quản Trị)
Apex OS is not just software; it is a **Bio-Digital Organism** modeled after the most efficient society in nature: The Beehive.

### A. The Essence (Tinh Hoa)
1.  **The Hive Mind (Trí Tuệ Tập Thể - Singularity):**
    *   *Nature:* No single bee knows everything, but the Hive knows everything.
    *   *Apex:* Every user trade, every win/loss feeds the AI. The system gets smarter with every user action. The "Signal" is the collective wisdom of the market, distilled.

2.  **The Waggle Dance (Giao Tiếp Hiệu Quả - Real-time Data):**
    *   *Nature:* Bees dance to share exact coordinates of nectar. No noise, just data.
    *   *Apex:* We do not spam. We send "Signals". Emails and notifications are precise vectors to profit (Nectar). If it doesn't lead to honey, we don't send it.

3.  **The Hexagon (Tối Ưu Hóa - Efficiency):**
    *   *Nature:* The most efficient shape in the universe. Maximum storage, minimum wax.
    *   *Apex:* Lean code, serverless architecture. Maximum value (features) with minimum friction (clicks). Every pixel must justify its existence.

4.  **Defense of the Honey (Bảo Mật & Lợi Nhuận):**
    *   *Nature:* Guard bees sacrifice themselves to protect the colony's energy store.
    *   *Apex:* Security is paramount. We protect the "Honey" (User Capital & Data) with aggressive "Stingers" (Anti-Fraud, 2FA, Audit Logs).

5.  **Role Specialization (Phân Tầng Xã Hội - CRM Tiers):**
    *   *Queen (The System/Admin):* The source of life and order.
    *   *Scouts (Free Users):* They explore, find signals, and bring data back.
    *   *Workers (Pro Users):* They execute, build capital, and sustain the ecosystem.
    *   *Guardians (Whales/VIP):* They provide liquidity and stability.

### B. Why Humans Must Learn This?
Humans are chaotic. Bees are aligned.
**Apex OS forces alignment.** It aligns User Greed with System Growth.
*   User wins -> System gets data -> AI gets smarter -> More Users win.
*   **The Perfect Loop.**

## 7. The Salesforce-Beehive Hybrid Pipeline (Max Level WOW)
We take the industry-standard Salesforce Pipeline and inject the biological efficiency of the Beehive to create a "Living Pipeline".

### A. The Metamorphosis (Pipeline Stages)
Standard CRM treats users as "Leads". We treat them as **Organisms** evolving through life stages.

| Salesforce Stage | Beehive Stage | Apex User State | The "Royal Jelly" (Trigger to Evolve) |
| :--- | :--- | :--- | :--- |
| **Lead (Cold)** | **Egg** | Visitor (No Sign-up) | **"The Nectar Scent":** SEO Articles, Viral Tweets showing 1000% gains. |
| **Lead (Warm)** | **Larva** | Free User (Signed up) | **"The Taste":** 3 Free Premium Signals. Show them the honey, don't just talk about it. |
| **Opportunity** | **Pupa** | Active Free User (Trading) | **"The Cocoon":** "You hit the Free Limit. You missed $500 profit today." (Ghost Profit). |
| **Customer** | **Worker Bee** | Paid Subscriber | **"The Hive Mind":** Access to full AI Analytics. "See what the whales are doing." |
| **Account (VIP)** | **Guard Bee** | Whale / High Tier | **"The Stinger":** Priority Support, Private Wealth Signals, OTC Deals. |
| **Partner** | **Queen** | Affiliate / Influencer | **"The Colony":** "Build your own hive. Earn 30% lifetime commissions." |

### B. The Pheromone System (Push Architecture)
In a hive, bees don't send memos. They release **Pheromones**—chemical signals that trigger *instant* biological responses.
We replace "Emails" with "Digital Pheromones".

#### 1. Alarm Pheromone (Urgency/Risk)
*   **Trigger:** Market Crash (-5% in 1 hour) or User Portfolio Risk > 20%.
*   **Push:** "⚠️ **CRITICAL:** Market Turbulence Detected. Protect your positions."
*   **Goal:** Instant login (Retention).

#### 2. Nectar Pheromone (Greed/Opportunity)
*   **Trigger:** AI detects >80% Win Rate Signal.
*   **Push:** "🍯 **HONEY POT:** BTC/USD Long. Confidence: 88%. Est. Profit: $1,200."
*   **Goal:** Trade Execution (Revenue).

#### 3. Queen Pheromone (Loyalty/Authority)
*   **Trigger:** Monthly Report or System Upgrade.
*   **Push:** "👑 **STATE OF THE HIVE:** Apex OS just got smarter. See your monthly performance."
*   **Goal:** Brand Loyalty (LTV).

### C. The "Waggle Dance" Algorithm (Predictive AI)
Bees dance to vote on the best location.
*   **Input:** We track which emails/signals get the most "Clicks" (Votes).
*   **Optimization:** The AI analyzes: * "Do users prefer 'Fear' (Alarm) or 'Greed' (Nectar)?"*
*   **Adaptation:** If User A clicks 'Fear' links, send more Risk Alerts. If User B clicks 'Greed', send more Signals.

## 8. The Email ERP: The Neural Sales Network (Max Level Architecture)
To achieve the "$1M Goal", we treat Email not as "Marketing", but as the **Central Nervous System** of the ERP.

### A. The "Neuron" Concept (Email as Code)
Every email sent is a **Digital Organism** with its own ID, purpose, and feedback loop.
*   **The Payload:** The content (Honey/Venom).
*   **The Sensor:** Tracking Pixel (Did they open? How long did they read?).
*   **The Synapse:** The Call-to-Action (Did they click? Did they buy?).

### B. The "Self-Adjusting" Algorithm (The Waggle Dance v2)
This is the "Salesforce Einstein" equivalent, but biological.
**The Loop:** `Stimulus -> Response -> Adaptation`

1.  **Stimulus (A/B Testing on Autopilot):**
    *   The system sends 2 variants of a "Nectar" email:
        *   *Variant A:* "Make $500 today" (Greed).
        *   *Variant B:* "Don't lose $500 today" (Fear).
2.  **Response (The Vote):**
    *   User clicks Variant B.
3.  **Adaptation (The DNA Rewrite):**
    *   The CRM tags this user as `PSYCH_PROFILE: RISK_AVERSE`.
    *   **FUTURE ACTION:** All future emails to this user will automatically shift tone to "Protection/Safety/Risk Management".
    *   *Result:* We stop selling "Gains" to a user who fears "Loss". We sell "Safety". **Conversion Rate doubles.**

### C. The "Ghost Pipeline" (Invisible ERP)
Salesforce requires manual data entry. **Apex ERP is invisible.**
*   User reads an email about "AI Signals" but doesn't click.
*   **CRM Action:** Tag `INTEREST: AI_SIGNALS` (Passive).
*   **Next Day:** The Dashboard changes. The "Signals" widget moves to the top.
*   **The WOW Factor:** The *entire platform* adapts to what they read in their email. The email dictates the UI.

### D. The "Queen's Decree" (The Closing Algorithm)
When `WOW_SCORE > 90` (Calculated from Open Rate + Click Rate + Platform Activity):
*   **Action:** The System generates a **One-Time Offer**.
*   **The Offer:** "Citizen [Name], your performance qualifies you for the Pro Tier. The Council has granted a 24-hour pass."

## 9. The Golden Comb: 6-Dimensional CRM (Beyond Salesforce)
Standard CRM is 2D (Stage vs. Time). The Beehive CRM is **6-Dimensional (The Hexagon)**.
We visualize every user as a cell in the Golden Comb. To "seal" the cell (Max LTV), we must build all 6 walls.

### The 6 Dimensions of a Perfect User:
1.  **North Wall: Pipeline Stage (Salesforce Standard)**
    *   *Metric:* Lead -> Opportunity -> Customer.
2.  **North-East Wall: Ghost Profit (Value)**
    *   *Metric:* How much money have they "lost" or "made"? (The Greed Metric).
3.  **South-East Wall: Neural Sentiment (Emotion)**
    *   *Metric:* Risk-Averse vs. Risk-Taker. (Determined by Email ERP).
4.  **South Wall: Engagement Frequency (Rhythm)**
    *   *Metric:* Daily Active Users (DAU) vs. Monthly (MAU). The "Heartbeat".
5.  **South-West Wall: Social Influence (Pollen)**
    *   *Metric:* Referral Count. Are they a "Scout" (Solo) or a "Queen" (Leader)?
6.  **North-West Wall: Skill Level (Evolution)**
    *   *Metric:* Win Rate. Are they evolving from Larva to Worker?

**The WOW Factor:**
The Admin Dashboard (`/admin/crm`) will render users as a **Hexagonal Grid**.
*   **Empty Cell:** New Lead.
*   **Gold Cell:** Perfect 6D User (High LTV, High Influence, High Skill).
*   **Action:** "Fill the missing wall." (e.g., User has High Skill but Low Influence -> Send "Referral Program" Pheromone).

## 10. The Swarm Protocol (Viral Weaponization)
This is the ultimate "Salesforce Killer". Salesforce manages individuals. Apex manages **Swarms**.

### A. The "Queen" Trigger
*   **Scenario:** A User with `INFLUENCE_SCORE > 80` (The Queen) executes a trade or buys a plan.
*   **System Action:** The CRM identifies all users referred by this Queen (The Colony).
*   **The Swarm Push:**
    *   *To the Colony:* "👑 **SWARM ALERT:** Your Leader [Name] just Longed BTC. Confidence: 92%. Follow the Swarm."
*   **Result:** One action triggers 1,000 actions. **Exponential Revenue.**

### B. The "Defense" Swarm
*   **Scenario:** A "Whale" (Guard Bee) liquidates a position.
*   **System Action:** Alert the Colony to protect the hive (Liquidity Injection or Hedging).
*   **Result:** Community-driven market stability.

### C. The "Migration" (Platform Shift)
*   **Scenario:** Telegram changes policy.
*   **System Action:** "Queen" moves to Discord.
*   **Swarm Push:** Automatically migrate the entire downline to the new platform via "Pheromone Link".

---
**Summary:**
We have evolved from a "List of Emails" (Mailchimp) -> "Pipeline" (Salesforce) -> **"Bio-Digital Organism" (Apex Beehive)**.

## 11. The Resonance Bell: Omni-Channel Harmony (No Spam, Just Vibe)
To achieve "Max Level WOW", we integrate App/Web Bells with Email. The goal is **Ambient Awareness** (The Hum of the Hive), not interruption.

### A. The "Frequency" Protocol (Anti-Spam Logic)
Bees don't buzz loudly unless there is danger or honey.
**Rule:** A user should never receive the same message on two channels simultaneously unless it is `CRITICAL`.

| Priority | Event Type | Channel Strategy | The "Vibe" |
| :--- | :--- | :--- | :--- |
| **L1: Ambient** | Social Like, Small Gain | **In-App Bell (Silent)** | A subtle red dot. No sound. "Check when you're ready." |
| **L2: Nectar** | High Prob Signal, Profit > $100 | **Push Notification (Vibrate)** | A gentle buzz. "Something good is waiting." |
| **L3: Critical** | Liquidation Risk, Security | **Email + Push (Sound) + SMS** | **"THE ALARM."** Wake up. Now. |

### B. The "Context-Aware" Delivery
The system knows where you are.
1.  **If User is Online (Web App):**
    *   *Action:* Show a **Toast Notification** (Top Right).
    *   *Email:* **SUPPRESS.** Do not send email. They saw it.
    *   *Result:* Zero Inbox Clutter.
2.  **If User is Offline (Mobile):**
    *   *Action:* Send **Push Notification**.
    *   *Email:* Delay 15 minutes. If Push not opened -> Send Email.
    *   *Result:* We chase them, but gently.

### C. The "Harmonic" UI (Visual WOW)
*   **The Golden Bell:** When a "Whale" signal arrives, the Bell icon doesn't just show a dot. It **glows gold** and pulses (CSS Animation).
*   **The Haptic Feedback:** On mobile, different signals have different vibration patterns.
    *   *Profit:* Two short, sharp pulses (Heartbeat).
    *   *Loss/Risk:* One long, heavy vibration (Warning).
*   **The "Zero State" WOW:** When a user clears all notifications, show a "Zen Garden" or "Calm Hive" animation. "All is well in the Hive."

### D. The "Echo" Effect (Cross-Device Sync)
*   Read on Phone -> Clears on Desktop instantly.
*   Action on Desktop -> Updates Badge on Phone instantly.
*   **The Magic:** The user feels like the system is a single, living organism that follows them, not a collection of dumb apps.




## 12. Technical Reality Check & Implementation Spec (The "How")
To ensure this is not just "hallucination", here is the concrete technical mapping.

### A. Database Schema Extensions (Supabase)
We need to extend the `beehive` schema to support these 6 dimensions.

```sql
-- 1. For "Ghost Profit" & "Sniper Triggers"
ALTER TABLE crm_pipelines ADD COLUMN metadata JSONB DEFAULT '{}';
-- metadata: { ghost_profit: 1250, win_streak: 3, loss_streak: 0, last_signal_viewed: 'sig_123' }

-- 2. For "Resonance Bell" (Notifications)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL, -- 'AMBIENT', 'NECTAR', 'CRITICAL'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channel_preference JSONB, -- { web: true, push: true, email: false }
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. For "Swarm Protocol" (Referral Tree)
-- We use the existing 'affiliates' table but add 'queen_id' for hierarchy optimization.
```

### B. The "Brain" Logic (CRMService Expansion)
The `CRMService` class will evolve into a "Coordinator" pattern.

```typescript
class BeehiveBrain {
  // The "Waggle Dance" (Decision Engine)
  async decidePush(userId: string, event: CRMEvent) {
    const userProfile = await this.get6DProfile(userId);
    const context = await this.getUserContext(userId); // Online? Offline?

    // 1. Check Frequency Protocol
    if (this.isSpamming(userId)) return;

    // 2. Select Channel
    if (context.isOnline) {
      await this.sendToast(userId, event); // Resonance Bell
    } else {
      await this.sendPush(userId, event);  // Mobile
      this.scheduleEmailFallback(userId, event, 15 * 60); // 15 min delay
    }

    // 3. Update Ghost Profit (if applicable)
    if (event.type === 'SIGNAL_MISSED') {
      await this.updateGhostProfit(userId, event.potentialProfit);
    }
  }
}
```

### C. The "Heartbeat" (Cron Jobs)
We need 3 distinct Cron Jobs (via Vercel Cron):
1.  **The Pulse (1 min):** Checks for `CRITICAL` events (Liquidation, Security).
2.  **The Harvester (1 hour):** Calculates "Ghost Profit" for all Free Users and updates their metadata.
3.  **The Queen's Speech (Daily):** Aggregates "Daily Digest" for users who opted out of real-time alerts.

### D. Feasibility Rating
*   **Ghost Profit:** 100% Feasible (Math + DB update).
*   **Resonance Bell:** 90% Feasible (Supabase Realtime for Web, need FCM/OneSignal for Mobile Push later. MVP: Web Toast + Email).
*   **Swarm Protocol:** 100% Feasible (Recursive SQL queries).
*   **Context Awareness:** 80% Feasible (Supabase Presence is reliable for Web).

**Conclusion:** This architecture is **Solid Code**, not Sci-Fi.

