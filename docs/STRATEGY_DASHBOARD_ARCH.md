# Strategy Dashboard Architecture (Sun Tzu Map)

**Status:** Planned
**Last Updated:** 2025-11-29
**Objective:** Visualize the 30 Phases of the $1M 2026 Roadmap mapped to Sun Tzu's Art of War.

## 1. Data Structure (Zero Tech Debt)
To avoid unnecessary database complexity for static strategic data, we will use a **Strongly Typed Constant** in the code. This ensures instant load times (SSG/SSR friendly) and zero database latency.

### Type Definition
```typescript
// src/types/strategy.ts

export type PhaseStatus = 'completed' | 'in-progress' | 'pending' | 'blocked';

export interface SunTzuPrinciple {
  chinese: string;
  english: string;
  meaning: string;
}

export interface StrategyPhase {
  id: number;
  name: string;
  description: string;
  status: PhaseStatus;
  sunTzu: SunTzuPrinciple;
  uiRoute?: string; // Route to the actual UI (if exists)
  cliCommand?: string; // CLI command reference
  impact: string; // Business impact
}
```

## 2. UI Architecture
### Page Layout (`src/app/[locale]/admin/strategy/page.tsx`)
- **Header:** "The Art of War: $1M Roadmap" with a progress bar (e.g., "Phase 30/30 Ready").
- **Layout:** Masonry or Vertical Timeline grid.

### Components (`src/components/strategy/`)
1.  **`StrategyHeader.tsx`**:
    - Displays the current "War Status" (e.g., "Victory Achieved").
    - Shows a random or context-aware Sun Tzu quote.
2.  **`PhaseTimeline.tsx`**:
    - Renders the list of phases.
    - Connects phases with a visual line.
3.  **`PhaseCard.tsx`**:
    - **Front:** Phase Name, Status Icon (✅/⏳), Impact.
    - **Hover/Click:** Sun Tzu Principle, CLI Command, Link to UI.
    - **Visuals:** Color-coded by status (Green = Done, Yellow = In Progress, Gray = Pending).

## 3. "Zero Tech Debt" Guidelines
1.  **Strict Typing:** No `any`. All phases must adhere to `StrategyPhase` interface.
2.  **Component Composition:** Small, focused components. No "God Components".
3.  **Accessibility:** All interactive elements must have `aria-label` and keyboard navigation.
4.  **Responsiveness:** Mobile-first design using Tailwind CSS grid/flex.
5.  **Performance:** Static data rendering (no `useEffect` fetch waterfalls).

## 4. Phase Mapping (Complete 30 Phases)

| Phase | Name | Sun Tzu Principle | UI Route | Status |
|-------|------|-------------------|----------|--------|
| 1 | Foundation | 始計 (Laying Plans) | `/dashboard` | ✅ Done |
| 2 | Email & SEO | 用間 (Use of Spies) | `/admin/marketing` | ⚠️ Missing |
| 3 | Analytics | 知彼知己 (Know Enemy) | `/admin/analytics-dashboard` | ✅ Done |
| 4 | Payment | 兵貴神速 (Speed is Essence) | `/admin/finance` | ✅ Done |
| 5 | Content | 以迂為直 (Indirect Approach) | `/blog` | ✅ Done |
| 6 | Viral | 致人而不致於人 (Pull Strategy) | `/admin/viral-economics` | ✅ Done |
| 7 | Retention | 先為不可勝 (Invincibility) | `/admin/retention` | ⚠️ Missing |
| 8 | Automation | 上兵伐謀 (Strategy over Fight) | `/admin/agents` | ✅ Done |
| 9 | Community | 同舟共濟 (Unity) | `/community` | ⚠️ Missing |
| 10 | System Ops | 地 (Terrain) | `/admin/system` | ✅ Done |
| 11 | Growth | 勢 (Energy) | `/admin/growth` | ⚠️ Missing |
| 12 | Optimization | 虛實 (Weak & Strong) | `/admin/ab-tests` | ✅ Done |
| 13 | Mobile App | 奇正 (Surprise/Orthodox) | `(App Store)` | ✅ Done |
| 14 | Enterprise | 連橫 (Alliances) | `/enterprise` | ✅ Done |
| 15 | Simulation | 廟算 (Temple Calc) | `/trading/paper` | ✅ Done |
| 16 | Affiliate | 借刀殺人 (Borrowed Knife) | `/affiliate` | ✅ Done |
| 17 | Global | 天 (Heaven/Timing) | `/i18n` | ✅ Done |
| 18 | Security | 守 (Defense) | `/admin/security` | ✅ Done |
| 19 | Social | 聚 (Gathering) | `/wolf-pack` | ✅ Done |
| 20 | Exit Strategy | 走為上 (Retreat) | `/admin/finance/valuation` | ⚠️ Missing |
| 21 | Telegram | 變 (Change) | `(Mini App)` | ✅ Done |
| 22 | AI Fund | 智 (Wisdom) | `/invest` | ⚠️ Missing |
| 23 | DAO | 道 (The Way) | `/dao` | ✅ Done |
| 24 | Launchpad | 火攻 (Fire Attack) | `/launchpad` | ✅ Done |
| 25 | Liquidity | 水 (Water) | `/admin/providers` | ✅ Done |
| 26 | Launch | 戰 (War) | `/launch` | ⚠️ Missing |
| 27 | Mobile Empire | 霸 (Hegemony) | `(App Store)` | ✅ Done |
| 28 | White Label | 分 (Division) | `/admin/whitelabel` | ⚠️ Missing |
| 29 | Algo Studio | 工 (Craft) | `/studio` | ✅ Done |
| 30 | Singularity | 天人合一 (Unity) | `/admin/singularity` | ⚠️ Missing |

## 5. Recovery Plan
If IDE resets, this file (`docs/STRATEGY_DASHBOARD_ARCH.md`) serves as the blueprint to rebuild the feature without guessing.
