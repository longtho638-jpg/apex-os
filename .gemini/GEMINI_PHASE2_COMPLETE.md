# GEMINI CLI - COMPLETE 2026 REDESIGN (PHASE 2)

**Status**: Homepage ✅ Done (manually by Anh)

**Remaining**: Landing + Pricing pages + Missing Components

**Timeline**: 2-3 hours

---

## 🎯 WHAT'S DONE (Reference)

Anh đã manually upgrade homepage với:
- ✅ Ultra-premium navigation (glassmorphic, animated)
- ✅ Hero với TypeWriter, GradientText, AnimatedNumber
- ✅ Dashboard mockup (CSS-only, no images needed!)
- ✅ Floating stats cards with motion
- ✅ Glassmorphic feature cards
- ✅ Professional footer

**Pattern established**: Copy this design language!

---

## 📋 TASK 1: Create Missing Components (30 min)

**Directory**: `src/components/marketing/`

### 1.1. Button3D.tsx

```typescript
'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Button3DProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'glass';
  className?: string;
}

export function Button3D({ 
  children, 
  onClick,
  variant = 'primary',
  className = ''
}: Button3DProps) {
  const baseClasses = 'relative px-8 py-4 rounded-xl font-semibold shadow-2xl transition-all duration-300';
  const variantClasses = variant === 'primary'
    ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/30 hover:shadow-emerald-500/50'
    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-xl';

  return (
    <motion.button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <span className="relative z-10">{children}</span>
      {variant === 'primary' && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600 via-cyan-600 to-emerald-600 bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </motion.button>
  );
}
```

### 1.2. AnimatedNumber.tsx

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedNumber({ 
  value, 
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0
}: AnimatedNumberProps) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const end = value;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [inView, value, duration]);

  const formatted = decimals > 0 
    ? count.toFixed(decimals)
    : Math.floor(count).toLocaleString();

  return (
    <span ref={ref} className="font-mono tabular-nums">
      {prefix}{formatted}{suffix}
    </span>
  );
}
```

### 1.3. GlassmorphicCard.tsx

```typescript
'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassmorphicCard({ children, className = '', hover = true }: GlassmorphicCardProps) {
  const Component = hover ? motion.div : 'div';
  
  return (
    <Component
      className={`
        relative p-8 rounded-2xl
        bg-white/5 backdrop-blur-xl
        border border-white/10
        shadow-xl shadow-black/20
        ${className}
      `}
      {...(hover && {
        whileHover: { 
          scale: 1.02,
          borderColor: 'rgba(16, 185, 129, 0.3)',
          transition: { duration: 0.3 }
        }
      })}
    >
      {children}
    </Component>
  );
}
```

### 1.4. ParticleBackground.tsx

```typescript
'use client';

export function ParticleBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float-slow" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="particle absolute w-1 h-1 bg-emerald-500/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 20}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

### 1.5. TypeWriter.tsx

```typescript
'use client';

import { useState, useEffect } from 'react';

interface TypeWriterProps {
  text: string;
  speed?: number;
  cursor?: boolean;
}

export function TypeWriter({ text, speed = 50, cursor = false }: TypeWriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return (
    <span>
      {displayedText}
      {cursor && currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}
```

### 1.6. GradientText.tsx

```typescript
'use client';

import { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
}

export function GradientText({ children, className = '' }: GradientTextProps) {
  return (
    <span className={`bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
}
```

---

## 📋 TASK 2: Update globals.css (10 min)

**File**: `src/app/globals.css`

**Add at the end**:

```css
/* 2026 Animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes float-delayed {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-30px); }
}

@keyframes float-slow {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes aurora {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes particle-float {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 0.3;
  }
  90% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-100vh) translateX(50px);
    opacity: 0;
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 8s ease-in-out infinite 1s;
}

.animate-float-slow {
  animation: float-slow 10s ease-in-out infinite 2s;
}

.animate-shimmer {
  animation: shimmer 3s linear infinite;
}

.animate-aurora {
  animation: aurora 8s ease-in-out infinite;
}

.particle {
  animation: particle-float linear infinite;
}

/* Perspective for 3D effects */
.perspective-1000 {
  perspective: 1000px;
}

.rotate-y-6 {
  transform: rotateY(6deg);
}

.rotate-y-12 {
  transform: rotateY(12deg);
}
```

---

## 📋 TASK 3: Redesign Landing Page (1h)

**File**: `src/app/[locale]/landing/page.tsx`

**Apply same design language as homepage**:

### Key Changes:

1. **Add imports** (match homepage):
```typescript
import { motion } from 'framer-motion';
import { Button3D } from '@/components/marketing/Button3D';
import { AnimatedNumber } from '@/components/marketing/AnimatedNumber';
import { GlassmorphicCard } from '@/components/marketing/GlassmorphicCard';
import { ParticleBackground } from '@/components/marketing/ParticleBackground';
```

2. **Add Navigation** (copy from homepage, same exact header)

3. **Upgrade Hero**:
   - Red pulsing warning badge (urgent!)
   - Larger animated loss counter
   - Glassmorphic CTA buttons

4. **Pain Points Section**:
   - Use GlassmorphicCard for each pain point
   - Add hover effects
   - Red theme (warning color)

5. **Solution Section**:
   - Green theme (success/healing)
   - Animated checkmarks
   - Before/After comparison visual

6. **Testimonials**:
   - Card carousel (auto-rotate)
   - 5 stars animated
   - Glassmorphic cards

7. **Add Footer** (copy from homepage exactly)

---

## 📋 TASK 4: Redesign Pricing Page (1h)

**File**: `src/app/[locale]/payment/page.tsx`

**Apply same design language**:

### Key Changes:

1. **Add imports** (same as landing)

2. **Add Navigation** (copy from homepage)

3. **Keep Hero** but make glassmorphic:
   - Upgrade badge styling
   - Add animated elements

4. **Pricing Cards**:
   - Already using GlassmorphicCard pattern
   - Enhance with:
     - Animated borders for POPULAR
     - Hover 3D lift
     - Smooth transitions
     - AnimatedNumber for prices

5. **Add comparison floating cards** (like homepage dashboard):
   - Before/After savings visualization
   - Animated dollar amounts

6. **Add Footer** (copy from homepage)

---

## 📋 TASK 5: Add Missing i18n Keys (15 min)

**File**: `messages/en.json`

**Add** (if missing):

```json
{
  "Homepage": {
    "nav": {
      "signin": "Sign In",
      "get_started": "Get Started"
    },
    "hero": {
      "badge": "Institutional Grade AI Trading Platform",
      "title_line1": "Agentic Trade Intelligence",
      "title_line2": "Built for Professionals",
      "description": "The world's first self-improving trading OS. AI agents that learn your style, execute 24/7, and compound your edge—while you sleep.",
      "cta_primary": "Start Free Trial",
      "cta_secondary": "Watch Demo",
      "trust_security": "Bank-Level Security",
      "trust_uptime": "99.9% Uptime",
      "trust_global": "Global Access"
    },
    "features": {
      "title": "Why Leading Traders Choose ApexOS",
      "subtitle": "Professional-grade tools designed for serious traders",
      "security_title": "Institutional Security",
      "security_desc": "Bank-grade encryption and READ-ONLY API access. We never touch your funds.",
      "execution_title": "Real-Time Execution",
      "execution_desc": "AI agents monitor and execute 24/7 with microsecond precision.",
      "performance_title": "Proven Performance",
      "performance_desc": "Average user recovers $500/month in optimized rebates and fees.",
      "multi_exchange_title": "Multi-Exchange",
      "multi_exchange_desc": "Connect Binance, OKX, Bybit, and 10+ major exchanges seamlessly."
    },
    "footer": {
      "company_desc": "Professional trading intelligence powered by AI.",
      "product": "Product",
      "resources": "Resources",
      "legal": "Legal",
      "rights": "All rights reserved.",
      "risk_disclosure": "Risk Disclosure: Trading cryptocurrencies involves substantial risk of loss. ApexOS provides tools and analytics but does not guarantee profits. Past performance does not indicate future results. Trade responsibly and only with capital you can afford to lose."
    }
  }
}
```

**Copy same to `messages/vi.json`** with Vietnamese translation!

---

## ✅ SUCCESS CRITERIA

**Components**:
- [ ] All 6 components created in `src/components/marketing/`
- [ ] No TypeScript errors
- [ ] Animations smooth

**Landing Page**:
- [ ] Navigation matches homepage
- [ ] Hero with urgency (red theme)
- [ ] Pain points glassmorphic
- [ ] Solution green theme
- [ ] Testimonials carousel
- [ ] Footer matches homepage

**Pricing Page**:
- [ ] Navigation matches homepage
- [ ] Pricing cards enhanced
- [ ] Animations on hover
- [ ] Footer matches homepage

**CSS**:
- [ ] All animations added to globals.css
- [ ] No missing classes

**i18n**:
- [ ] All keys in en.json
- [ ] All keys in vi.json
- [ ] No missing translations

---

## 🚀 EXECUTION ORDER

1. **Create all 6 components** (foundation first!)
2. **Update globals.css** (animations ready)
3. **Add i18n keys** (text ready)
4. **Redesign Landing page**
5. **Redesign Pricing page**
6. **Test locally** (`npm run dev`)
7. **Commit** with epic message

---

## 💎 QUALITY CHECKPOINTS

**Before committing, verify**:

```bash
# No TypeScript errors
npm run build

# All pages work locally
npm run dev
# Visit:
# - http://localhost:3000 (homepage)
# - http://localhost:3000/landing
# - http://localhost:3000/payment

# Check mobile responsive
# - Open DevTools
# - Toggle device toolbar
# - Test all 3 pages on iPhone/iPad views
```

---

## 🎯 GEMINI - FINAL INSTRUCTIONS

**Remember**:
- Copy navigation + footer EXACTLY from homepage
- Use same color palette (emerald, cyan, purple accents)
- All cards glassmorphic
- Smooth animations everywhere
- Mobile responsive
- No console errors

**The goal**:
3 pages with IDENTICAL premium fintech design language that looks like it came from a $1M agency!

**不鳴則已，一鳴驚人 - FINISH WITH THUNDER!** ⚡

---

**GO COMPLETE THE MASTERPIECE!** 🚀🔥
