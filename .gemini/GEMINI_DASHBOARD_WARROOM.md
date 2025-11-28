# GEMINI CLI - DASHBOARD: THE COMMAND CENTER (WAR ROOM)

**Mission**: Transform Dashboard into a TACTICAL COMMAND CENTER applying Sun Tzu principles

**Philosophy**: "運籌帷幄，決勝千里" - Plan in Command Tent, Win Thousand Miles Away

**Goal**: Users feel POWERFUL, IN CONTROL, SEE MONEY BEING MADE

---

## 🎯 SUN TZU PRINCIPLES FOR DASHBOARD

### 1. "知彼知己，百戰不殆" - Intelligence is Victory

**Translation**: Perfect information = Perfect decisions

**Dashboard Must Show**:
- Real-time P&L (know your position)
- All exchange balances (know your resources)
- Active AI agents (know your army)
- Market opportunities (know the battlefield)
- Risk alerts (know the dangers)

**Implementation**:
- Live data streaming (WebSocket simulation)
- Clear metrics hierarchy
- Alert system (red/yellow/green)
- Comparative analytics

### 2. "兵貴神速" - Speed is Essence of War

**Translation**: Fast action wins

**Dashboard Must Enable**:
- One-click actions
- Hot keys for pros
- Quick filters
- Instant analytics
- Real-time updates

**Implementation**:
- < 100ms interactions
- Keyboard shortcuts
- Smart defaults
- Cached data

### 3. "避實擊虛" - Avoid Strength, Attack Weakness

**Translation**: Focus on opportunities, not problems

**Dashboard Must Highlight**:
- Green opportunities (where to act)
- Underutilized exchanges
- Optimizable trades
- Savings potential
- Quick wins

**Implementation**:
- Opportunity cards
- Actionable insights
- AI recommendations
- One-click optimize

### 4. "以正合，以奇勝" - Win with Unexpected

**Translation**: Stand by convention, win by surprise

**Dashboard Must Surprise**:
- AI insights users didn't know
- Hidden patterns revealed
- Unexpected savings found
- Gamification elements
- Easter eggs for power users

**Implementation**:
- AI "Aha!" moments
- Discovery notifications
- Achievement badges
- Leaderboards (optional)

### 5. "善戰者，求之於勢" - Create Momentum

**Translation**: Good commanders create winning momentum

**Dashboard Must Show**:
- Winning streaks
- Growth trends
- Compounding effects
- Progress to goals
- Milestones achieved

**Implementation**:
- Trend charts
- Goal trackers
- Celebration animations
- Historical comparisons

---

## 🎨 DASHBOARD REDESIGN SPEC

### Current Dashboard (Basic)

**Problems**:
- Static tiles
- No hierarchy
- Overwhelming data
- No guidance
- Boring!

### NEW Dashboard (Command Center):

**Layout Structure**:

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 APEX COMMAND CENTER                    [Sync] [Settings]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ 💰 Total P&L    │  │ 🤖 AI Agents │  │ ⚡ Win Rate   │   │
│  │ +$12,450.32     │  │ 12 Active    │  │ 94.7%        │   │  ← Hero Metrics
│  │ +127% ↗         │  │ All Optimal  │  │ +2.1% Today  │   │
│  └─────────────────┘  └──────────────┘  └──────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 📊 Performance Chart (Interactive)                   │    │  ← Main Chart
│  │ ┌──────────────────────────────────────────────┐    │    │
│  │ │ [Area chart with gradient fill]              │    │    │
│  │ │ Hoverable tooltips, time range selector     │    │    │
│  │ └──────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  🎯 AI RECOMMENDATIONS                                       │
│  ┌───────────────────────────────────────────────────┐      │
│  │ 💡 Switch 20% of BTC to OKX for +$47/mo savings  │      │  ← Action Cards
│  │ [Ignore] [Apply Now →]                            │      │
│  └───────────────────────────────────────────────────┘      │
│                                                               │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │ 📈 Exchanges   │  │ 🔔 Alerts      │  │ 🏆 Achievements│ │  ← Secondary
│  │ 5 Connected    │  │ 3 New          │  │ 7 Unlocked    │ │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 💎 COMPONENT ARCHITECTURE

**File**: `src/app/[locale]/dashboard/page.tsx`

### Phase 1: Imports & Setup

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Shield,
  Activity,
  DollarSign,
  Sparkles,
  Bell,
  Trophy,
  ArrowRight,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  ChevronRight
} from 'lucide-react';

import { GlassmorphicCard } from '@/components/marketing/GlassmorphicCard';
import { AnimatedNumber } from '@/components/marketing/AnimatedNumber';
import { Button3D } from '@/components/marketing/Button3D';
import { useTranslations } from '@/contexts/I18nContext';

// Chart component (use recharts or custom)
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
```

### Phase 2: Mock Data (Demo Mode)

```typescript
const MOCK_DATA = {
  totalPnL: 12450.32,
  pnlChange: 127,
  activeAgents: 12,
  winRate: 94.7,
  winRateChange: 2.1,
  
  chartData: [
    { date: 'Mon', value: 8200 },
    { date: 'Tue', value: 9100 },
    { date: 'Wed', value: 8900 },
    { date: 'Thu', value: 10500 },
    { date: 'Fri', value: 11200 },
    { date: 'Sat', value: 11800 },
    { date: 'Sun', value: 12450 }
  ],
  
  recommendations: [
    {
      id: 1,
      type: 'optimization',
      title: 'Switch 20% of BTC to OKX',
      savings: 47,
      impact: 'high',
      action: 'Apply Now'
    },
    {
      id: 2,
      type: 'opportunity',
      title: 'Arbitrage ETH/USDT detected',
      profit: 125,
      impact: 'medium',
      action: 'Execute Trade'
    }
  ],
  
  exchanges: [
    { name: 'Binance', balance: 8500, status: 'optimal', color: 'emerald' },
    { name: 'OKX', balance: 4200, status: 'optimal', color: 'cyan' },
    { name: 'Bybit', balance: 2100, status: 'warning', color: 'amber' }
  ],
  
  alerts: [
    { id: 1, type: 'success', message: 'New rebate received: $47.23', time: '5m ago' },
    { id: 2, type: 'info', message: 'Agent #7 optimized your BTC position', time: '12m ago' },
    { id: 3, type: 'warning', message: 'High volatility detected on ETH', time: '25m ago' }
  ],
  
  achievements: [
    { id: 1, icon: '🎯', name: 'First $10K', unlocked: true },
    { id: 2, icon: '⚡', name: '100 Trades', unlocked: true },
    { id: 3, icon: '🏆', name: 'Perfect Week', unlocked: true },
    { id: 4, icon: '💎', name: 'VIP Tier', unlocked: false }
  ]
};
```

### Phase 3: Main Component

```typescript
export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSyncing(false);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              🎯 Command Center
            </h1>
            <p className="text-zinc-400">
              Real-time trading intelligence • Last updated: <span className="text-emerald-400">Just now</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleSync}
              disabled={isSyncing}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </motion.button>
            
            <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Metrics */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Total P&L */}
          <GlassmorphicCard className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">Total P&L</span>
                </div>
                <button
                  onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  {isBalanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="text-3xl font-bold mb-2">
                {isBalanceVisible ? (
                  <>
                    $<AnimatedNumber value={MOCK_DATA.totalPnL} decimals={2} />
                  </>
                ) : (
                  <span className="text-zinc-600">••••••</span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-bold">+{MOCK_DATA.pnlChange}%</span>
                <span className="text-xs text-zinc-500">vs last week</span>
              </div>
            </div>
          </GlassmorphicCard>

          {/* Active Agents */}
          <GlassmorphicCard className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/20 transition-colors" />
            
            <div className="relative">
              <div className="flex items-center gap-2 text-zinc-400 mb-4">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">AI Agents</span>
              </div>
              
              <div className="text-3xl font-bold mb-2">
                <AnimatedNumber value={MOCK_DATA.activeAgents} duration={1000} />
                <span className="text-lg text-zinc-500 ml-2">Active</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm text-emerald-400">All Optimal</span>
              </div>
            </div>
          </GlassmorphicCard>

          {/* Win Rate */}
          <GlassmorphicCard className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-colors" />
            
            <div className="relative">
              <div className="flex items-center gap-2 text-zinc-400 mb-4">
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">Win Rate</span>
              </div>
              
              <div className="text-3xl font-bold mb-2">
                <AnimatedNumber value={MOCK_DATA.winRate} decimals={1} />%
              </div>
              
              <div className="flex items-center gap-2 text-purple-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-bold">+{MOCK_DATA.winRateChange}%</span>
                <span className="text-xs text-zinc-500">today</span>
              </div>
            </div>
          </GlassmorphicCard>
        </div>

        {/* Performance Chart */}
        <GlassmorphicCard>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">Performance</h3>
              <p className="text-sm text-zinc-400">Your trading journey</p>
            </div>
            
            <div className="flex gap-2">
              {['24h', '7d', '30d', 'All'].map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range.toLowerCase())}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTimeRange === range.toLowerCase()
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_DATA.chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#52525b" />
                <YAxis stroke="#52525b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassmorphicCard>

        {/* AI Recommendations */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xl font-bold">AI Recommendations</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
              {MOCK_DATA.recommendations.length} NEW
            </span>
          </div>

          <div className="space-y-4">
            {MOCK_DATA.recommendations.map((rec, i) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassmorphicCard className="group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        rec.impact === 'high' ? 'bg-emerald-500/20' :
                        rec.impact === 'medium' ? 'bg-cyan-500/20' :
                        'bg-zinc-500/20'
                      }`}>
                        <Zap className={`w-5 h-5 ${
                          rec.impact === 'high' ? 'text-emerald-400' :
                          rec.impact === 'medium' ? 'text-cyan-400' :
                          'text-zinc-400'
                        }`} />
                      </div>
                      
                      <div>
                        <h4 className="font-bold mb-1">{rec.title}</h4>
                        <p className="text-sm text-emerald-400">
                          Potential savings: ${rec.savings || rec.profit}/month
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
                        Ignore
                      </button>
                      <Button3D className="py-2 px-6 text-sm group">
                        {rec.action}
                        <ArrowRight className="inline ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button3D>
                    </div>
                  </div>
                </GlassmorphicCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Grid: Exchanges, Alerts, Achievements */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Exchanges */}
          <GlassmorphicCard>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Connected Exchanges
            </h3>
            <div className="space-y-3">
              {MOCK_DATA.exchanges.map((ex, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div>
                    <div className="font-medium">{ex.name}</div>
                    <div className="text-xs text-zinc-500">${ex.balance.toLocaleString()}</div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    ex.status === 'optimal' ? 'bg-emerald-500' :
                    ex.status === 'warning' ? 'bg-amber-500' :
                    'bg-red-500'
                  } animate-pulse`} />
                </div>
              ))}
            </div>
          </GlassmorphicCard>

          {/* Alerts */}
          <GlassmorphicCard>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-cyan-400" />
              Recent Alerts
            </h3>
            <div className="space-y-3">
              {MOCK_DATA.alerts.map((alert) => (
                <div key={alert.id} className="p-3 rounded-lg bg-white/5 text-sm">
                  <div className="font-medium mb-1">{alert.message}</div>
                  <div className="text-xs text-zinc-500">{alert.time}</div>
                </div>
              ))}
            </div>
          </GlassmorphicCard>

          {/* Achievements */}
          <GlassmorphicCard>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Achievements
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {MOCK_DATA.achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-4 rounded-xl text-center ${
                    ach.unlocked
                      ? 'bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30'
                      : 'bg-white/5 border border-white/10 opacity-50'
                  }`}
                >
                  <div className="text-2xl mb-2">{ach.icon}</div>
                  <div className="text-xs font-medium">{ach.name}</div>
                </div>
              ))}
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ SUCCESS CRITERIA

**Visual**:
- [ ] Matches homepage design language
- [ ] Glassmorphic cards everywhere
- [ ] Smooth animations (60fps)
- [ ] Color-coded status (green/yellow/red)

**Functional**:
- [ ] Hide/show balance toggle
- [ ] Time range selector works
- [ ] Chart responsive
- [ ] Recommendations actionable
- [ ] Real-time feel (mock updates)

**Psychological**:
- [ ] Shows WINNING (green everywhere!)
- [ ] Action-oriented (CTAs clear)
- [ ] Gamification (achievements)
- [ ] Intelligence (AI recommendations)
- [ ] Control (sync, settings)

**Performance**:
- [ ] <2s initial load
- [ ] <100ms interactions
- [ ] Mobile responsive
- [ ] No console errors

---

## 🚀 GEMINI - EXECUTE!

**Remember**:
- Dashboard = Command Center (not boring data dump!)
- Apply Sun Tzu (intelligence, speed, momentum)
- Same design as homepage (glassmorphic, emerald/cyan gradients)
- Make users feel POWERFUL
- Show them making MONEY

**運籌帷幄，決勝千里**
*Plan in tent, win thousand miles!*

Make dashboard where traders WANT to spend time!

---

**GO CREATE THE WAR ROOM!** 🎯⚡💎
