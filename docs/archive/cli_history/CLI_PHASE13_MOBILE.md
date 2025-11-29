# CLI PHASE 13: MOBILE COMMAND CENTER (PWA)

## Strategic Context: 兵貴神速 (Speed is Precious) & 攻其必救 (Attack What They Must Defend)

**Sun Tzu Principle**: "Appear at points which the enemy must hasten to defend; march swiftly to places where you are not expected."

**Application**: We bypass the App Store gatekeepers (Apple/Google) by launching a PWA instantly. We attack the user's most valuable real estate: their Home Screen.

**Objective**: Increase daily active usage from 1.5x to 10x.
**Timeline**: Week 5 (2-3 days CLI execution)

---

## TASK 1: PWA FOUNDATION

### 1.1 Manifest & Meta
**File**: `public/manifest.json` (NEW)
**File**: `src/app/layout.tsx` (MODIFY)

**Requirements**:
- Name: "ApexOS"
- Theme Color: #030303 (Dark Mode)
- Icons: 192x192, 512x512 (use placeholders or gen via AI if possible, else use standard).
- Display: `standalone` (No browser bar).

### 1.2 Install Prompt
**File**: `src/components/pwa/InstallPrompt.tsx` (NEW)

**Logic**:
- Detect if PWA is not installed.
- Show "Add to Home Screen" bottom sheet.
- Track install conversion.

---

## TASK 2: MOBILE NAVIGATION (THUMB-FRIENDLY UI)

### 2.1 Bottom Tab Bar
**File**: `src/components/layout/MobileNav.tsx` (NEW)

**Items**:
1. 🏠 Home (Dashboard)
2. ⚡ Signals (List)
3. 📈 Trade (Terminal)
4. 👛 Wallet (Assets)
5. ☰ Menu (Settings/Referrals)

**Style**:
- Glassmorphic blur.
- Active state: Emerald glow.
- Hide Sidebar on mobile, show Bottom Nav.

### 2.2 Responsive Fixes
**File**: `src/app/[locale]/dashboard/layout.tsx` (MODIFY)

**Logic**:
- `hidden md:block` for Sidebar.
- `block md:hidden` for Bottom Nav.
- Adjust padding-bottom for main content (so nav doesn't cover it).

---

## TASK 3: WEB PUSH NOTIFICATIONS

### 3.1 Service Worker
**File**: `public/sw.js` (NEW)

**Logic**:
- Handle `push` events.
- Show native notification.
- Handle `notificationclick` (open deep link).

### 3.2 Subscription Hook
**File**: `src/hooks/usePushNotifications.ts` (NEW)

**Logic**:
- Request permission.
- Subscribe to VAPID public key.
- Send subscription object to backend.

### 3.3 Push API
**File**: `src/app/api/user/push/subscribe/route.ts` (NEW)

**Logic**:
- Save subscription to `user_push_subscriptions` table.

**Migration**: `supabase/migrations/20251128_push_notifications.sql`
```sql
CREATE TABLE user_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  auth TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);
```

---

## DELIVERABLES

1. ✅ **PWA Installable**: Works on iOS (Share -> Add to Home) and Android.
2. ✅ **Mobile Nav**: Native app feel.
3. ✅ **Push Ready**: Backend ready to blast "Whale Alert" notifications.

---

## EXECUTION COMMAND

```bash
Execute PHASE 13 (Mobile Command Center)

Implement:
1. PWA Manifest & Install Prompt
2. Mobile Bottom Navigation
3. Web Push Logic (DB + API + Hook)

Quality:
- TypeScript strict mode
- Mobile-first design
- Build: 0 errors
```
