# CLI PHASE 27: THE MOBILE EMPIRE (NATIVE APP)

## Strategic Context: 聲東擊西 (Make a Sound in the East, Strike in the West)

**Sun Tzu Principle**: "Appear at points which the enemy must hasten to defend; march swiftly to places where you are not expected."

**Application**: While competitors fight on the Web, we flank them with a Native App. We re-use our Web logic (React) to build Mobile (React Native/Expo) at 10x speed.

**Objective**: Launch iOS & Android Apps.
**Timeline**: Week 9 (3-4 days CLI execution)

---

## TASK 1: EXPO SETUP

### 1.1 Init Project
**Command**:
```bash
npx create-expo-app@latest mobile -t default
```

### 1.2 Shared Logic
**Strategy**: Monorepo-lite.
- Symlink `src/lib` and `src/types` to `mobile/src/shared`.
- Ensure API clients work in React Native (fetch is polyfilled).

---

## TASK 2: NATIVE NAVIGATION

### 2.1 React Navigation
**Dependencies**: `react-navigation`, `expo-router`.

**Structure**:
- `(tabs)`: Dashboard, Signals, Trade, Wallet, Settings.
- `(auth)`: Login, Signup.
- `(stack)`: Signal Details, Trade Execution.

### 2.2 UI Components
**Library**: `NativeWind` (Tailwind for RN) or `Tamagui`.
**Components**: Re-create key UI cards (GlassCard) using RN View/BlurView.

---

## TASK 3: NATIVE PUSH NOTIFICATIONS

### 3.1 Expo Notifications
**Config**: `app.json` (plugins).

### 3.2 Handler
**File**: `mobile/src/hooks/useNotifications.ts` (NEW)

**Logic**:
- Get Expo Push Token.
- Send to Backend (Reuse `/api/user/push/subscribe` - modify to accept Expo tokens).

---

## DELIVERABLES

1. ✅ **Mobile Project**: Expo app running.
2. ✅ **Nav**: Smooth tab switching.
3. ✅ **Push**: Native device alerts.

---

## EXECUTION COMMAND

```bash
Execute PHASE 27 (Mobile Empire)

Implement:
1. Expo Init (mobile/)
2. Native Navigation (Tabs)
3. Push Notification Handler

Quality:
- Code Sharing: Reuse Web Logic
- Build: Expo Prebuild success
```
