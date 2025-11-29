# CLI PHASE 21: TELEGRAM MINI APP (THE VIRAL VECTOR)

## Strategic Context: 借路滅虢 (Borrow a Road to Conquer Guo)

**Sun Tzu Principle**: "Borrow the resources of an ally to attack a common enemy."

**Application**: Telegram is the road. 900M users are the territory. We borrow Telegram's infrastructure to launch our app directly into users' pockets without App Store friction.

**Objective**: Acquire 100,000 users via Telegram Viral Loops.
**Timeline**: Week 7 (2-3 days CLI execution)

---

## TASK 1: TELEGRAM BOT WEBHOOK

### 1.1 Bot Token Setup
- Env Var: `TELEGRAM_BOT_TOKEN`
- Env Var: `TELEGRAM_WEBHOOK_SECRET`

### 1.2 Webhook Route
**File**: `src/app/api/telegram/webhook/route.ts` (NEW)

**Logic**:
- Handle `/start`: Send Welcome Message + "Open App" button.
- Handle `/help`: Send Support info.
- Verify updates via secret token.

---

## TASK 2: MINI APP INTEGRATION

### 2.1 Telegram SDK Provider
**File**: `src/components/providers/TelegramProvider.tsx` (NEW)

**Requirements**:
- Load `@twa-dev/sdk` script.
- Initialize Mini App.
- Handle Theme params (Dark mode sync).
- Expand to full height.

### 2.2 Layout Integration
**File**: `src/app/layout.tsx` (MODIFY)
- Wrap children with `TelegramProvider`.

---

## TASK 3: VIRAL MECHANICS (NATIVE SHARE)

### 3.1 Invite Button
**File**: `src/components/telegram/TelegramInviteButton.tsx` (NEW)

**Logic**:
- Use `utils.openTelegramLink` to open native share sheet.
- Pre-fill message with Referral Link (`t.me/ApexOS_Bot?start=ref_123`).

### 3.2 Referral Processing
- Update `/start` logic in Task 1.2 to parse `ref_123` parameter.
- Auto-attribute referral on first launch.

---

## DELIVERABLES

1. ✅ **Bot Backend**: Responds to commands.
2. ✅ **Mini App**: Web app runs inside Telegram.
3. ✅ **Viral Loop**: Native sharing integration.

---

## EXECUTION COMMAND

```bash
Execute PHASE 21 (Telegram Mini App)

Implement:
1. Telegram Webhook (API)
2. Telegram Provider (SDK)
3. Native Invite Button

Quality:
- TypeScript strict mode
- Security: Validate Telegram Init Data
- Build: 0 errors
```
