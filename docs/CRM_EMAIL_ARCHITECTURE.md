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
