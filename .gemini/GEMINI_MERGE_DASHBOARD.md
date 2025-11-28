# GEMINI CLI - MERGE DASHBOARD: OLD + NEW

**Mission**: Combine OLD dashboard features + NEW Command Center design

**Problem**: Homepage redesigned, but dashboard lost all features!

**Solution**: MERGE both UIs into one premium dashboard

---

## 🎯 WHAT TO KEEP FROM OLD DASHBOARD

**File to reference**: Check git history or backup

### Components to PRESERVE:

1. **Sidebar** (left menu):
   - Bảng Điều Khiển
   - Giao Dịch  
   - Theo Dõi PnL
   - Hoàn Phí
   - Giới Thiệu
   - Báo Cáo
   - Thanh Toán
   - Tài Nguyên
   - Cài Đặt
   - **"Năng cấp Founders" button** ⭐

2. **UpgradeBanner** (for free users):
   ```typescript
   import UpgradeBanner from '@/components/dashboard/UpgradeBanner';
   {isFree && <UpgradeBanner />}
   ```

3. **Tier Detection**:
   ```typescript
   import { useUserTier } from '@/hooks/useUserTier';
   const { tier, isFree, isFounders, slot } = useUserTier();
   ```

4. **Founders Badge** (header):
   ```typescript
   {isFounders && (
     <div className="founders-badge">
       <Crown /> FOUNDERS #{slot}
     </div>
   )}
   ```

5. **Data Hooks**:
   ```typescript
   import { usePnL, useRebates, useLeverage } from '@/hooks/useApi';
   const { data: pnlData } = usePnL();
   const { data: rebateData } = useRebates();
   ```

6. **BentoGrid Layout**:
   ```typescript
   import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
   ```

7. **ApexIdentityEngine** (ZenWidget):
   ```typescript
   import ApexIdentityEngine from '@/components/dashboard/ZenWidget';
   ```

8. **ConnectExchange**:
   ```typescript
   import ConnectExchange from '@/components/dashboard/ConnectExchange';
   ```

---

## 🎨 WHAT TO ADD FROM NEW DESIGN

From `.gemini/GEMINI_DASHBOARD_WARROOM.md`:

1. **Glassmorphic Cards** (instead of basic cards)
2. **AnimatedNumber** component
3. **Real-time feel** (mock updates)
4. **AI Recommendations** section
5. **Achievement badges**
6. **Better typography** (emerald/cyan accents)

---

## 📋 MERGE STRATEGY

**File**: `src/app/[locale]/dashboard/page.tsx`

### Structure:

```typescript
'use client';

import { Sidebar } from '@/components/os/sidebar';
import { useUserTier } from '@/hooks/useUserTier';
import { useAuth } from '@/contexts/AuthContext';
import { usePnL, useRebates } from '@/hooks/useApi';
import UpgradeBanner from '@/components/dashboard/UpgradeBanner';
import ApexIdentityEngine from '@/components/dashboard/ZenWidget';
import ConnectExchange from '@/components/dashboard/ConnectExchange';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';

// NEW components
import { GlassmorphicCard } from '@/components/marketing/GlassmorphicCard';
import { AnimatedNumber } from '@/components/marketing/AnimatedNumber';

export default function DashboardPage() {
  const { user } = useAuth();
  const { tier, isFree, isFounders, slot } = useUserTier();
  const { data: pnlData } = usePnL();
  const { data: rebateData } = useRebates();

  return (
    <div className="flex h-screen bg-[#030303] text-white">
      {/* OLD: Sidebar (KEEP!) */}
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6">
        {/* OLD: Header with Founders badge (KEEP!) */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">🎯 Command Center</h2>
            <p className="text-zinc-400">Welcome back, {user.email}</p>
          </div>
          
          {isFounders && (
            <div className="founders-badge">
              <Crown /> FOUNDERS #{slot}
            </div>
          )}
        </header>

        {/* OLD: Upgrade banner for free users (KEEP!) */}
        {isFree && <UpgradeBanner />}

        {/* NEW: Hero metrics with glassmorphic cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <GlassmorphicCard>
            <div className="text-zinc-400 text-sm mb-2">Total P&L</div>
            <div className="text-3xl font-bold">
              $<AnimatedNumber value={pnlData?.total_pnl ?? 12450} decimals={2} />
            </div>
            <div className="text-emerald-400 text-sm">+127% vs last week</div>
          </GlassmorphicCard>
          {/* ... more metrics */}
        </div>

        {/* OLD: BentoGrid with data (KEEP structure, upgrade cards!) */}
        <BentoGrid>
          {/* Replace basic cards with GlassmorphicCard */}
          <BentoGridItem>
            <GlassmorphicCard>
              {/* OLD data, NEW design */}
            </GlassmorphicCard>
          </BentoGridItem>
        </BentoGrid>

        {/* OLD: ApexIdentityEngine (KEEP!) */}
        <ApexIdentityEngine />

        {/* OLD: Connect Exchange (KEEP!) */}
        <ConnectExchange />

        {/* NEW: AI Recommendations (ADD!) */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">AI Recommendations</h3>
          {/* ... recommendations from new design */}
        </div>
      </main>
    </div>
  );
}
```

---

## ✅ CHECKLIST

**Must preserve**:
- [ ] Sidebar with all menu items
- [ ] "Năng cấp Founders" button in sidebar
- [ ] Founders badge in header
- [ ] UpgradeBanner for free users
- [ ] useUserTier hook (tier detection)
- [ ] usePnL, useRebates hooks (real data)
- [ ] BentoGrid layout
- [ ] ApexIdentityEngine (ZenWidget)
- [ ] ConnectExchange component

**Must upgrade**:
- [ ] Use GlassmorphicCard instead of basic cards
- [ ] Add AnimatedNumber for metrics
- [ ] Add AI Recommendations section
- [ ] Better color scheme (emerald/cyan)
- [ ] Smoother animations

**Result**:
- ✅ ALL old features working
- ✅ NEW premium design
- ✅ Best of both worlds!

---

## 🚀 EXECUTION STEPS

1. **Backup current dashboard** (in case need to reference)
2. **Import OLD components**:
   - Sidebar
   - UpgradeBanner  
   - useUserTier
   - Data hooks
   - BentoGrid
   - ApexIdentityEngine
   - ConnectExchange

3. **Import NEW components**:
   - GlassmorphicCard
   - AnimatedNumber
   - Button3D

4. **Merge layout**:
   - Keep Sidebar
   - Keep header with Founders badge
   - Upgrade metric cards → GlassmorphicCard
   - Keep BentoGrid but with new card style
   - Keep special components (ZenWidget, ConnectExchange)
   - Add AI Recommendations section

5. **Test**:
   - Free user sees UpgradeBanner ✓
   - Founders see badge ✓
   - All menu items work ✓
   - Real data loads ✓
   - Animations smooth ✓

---

## 💎 QUALITY REQUIREMENTS

**Functionality**:
- All old features must work
- No broken links
- Data hooks connected
- Tier system working

**Design**:
- Match homepage aesthetics (glassmorphic)
- Emerald/cyan color scheme
- Smooth animations
- Mobile responsive

**Performance**:
- <2s load time
- Smooth scrolling
- No layout shift

---

## 🎯 GEMINI - DO THIS!

**Remember**:
- DON'T delete old features
- DON'T break existing functionality  
- DO upgrade visual design
- DO keep all components
- DO test free vs Founders experience

**Goal**: Dashboard that has BOTH:
- All functionality from before
- Premium design from Command Center spec

---

**GO MERGE THE BEST OF BOTH WORLDS!** 🔥💎
