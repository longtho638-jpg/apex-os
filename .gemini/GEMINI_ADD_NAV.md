# GEMINI CLI - ADD FINTECH N AVIGATION TO 2 PAGES

**Mission**: Add professional fintech navigation + footer to Landing and Pricing pages

**Timeline**: 30 minutes

**Deliverables**: 2 updated pages with consistent navigation

---

## 🎯 REFERENCE: Homepage Navigation (COPY THIS PATTERN)

**File to reference**: `src/app/[locale]/page.tsx`

**What to copy**:
1. Header navigation (lines 24-101) - Logo, menu, mobile hamburger, CTAs
2. Footer (lines ~200-280) - Company, Product, Resources, Legal sections

---

## 📋 TASK 1: Update Landing Page (15 min)

**File**: `src/app/[locale]/landing/page.tsx`

### Instructions:

1. **Add imports** (top of file):
```typescript
import { useState } from 'react'; // Already has useTranslations
import { useRouter } from 'next/navigation';
import { Menu, X, ChevronRight, Twitter, Linkedin, Github, Mail } from 'lucide-react';
```

2. **Add state & router** (inside component):
```typescript
const router = useRouter();
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
```

3. **Replace current minimal header** with professional navigation:
   - Copy header from homepage (lines 24-101)
   - Keep same navigation items: Features, How It Works, Pricing, Resources
   - Sign In → `/login`, Get Started → `/signup`

4. **Replace minimal footer** (currently lines 195-197):
   - Copy footer from homepage (comprehensive version)
   - Same structure: Company, Product, Resources, Legal
   - Social icons: Twitter, LinkedIn, GitHub
   - Email: support@apexos.io
   - Risk disclosure at bottom

5. **Adjust content**:
   - Keep all existing sections (Hero, Pain Points, Solution, Social Proof, CTA, FAQ)
   - Just wrap with new header + footer

---

## 📋 TASK 2: Update Pricing Page (15 min)

**File**: `src/app/[locale]/payment/page.tsx`

### Instructions:

1. **Add imports** (same as Task 1)

2. **Add state & router** (inside component)

3. **Add header navigation** BEFORE hero section:
   - Same header as homepage
   - Navigation items: Features, How It Works, Pricing, Resources

4. **Add footer** AFTER guarantee section (currently around line 240):
   - Same comprehensive footer as homepage

5. **Keep all existing**:
   - Hero section
   - Trust signals
   - Pricing tiers with toggle
   - Money-back guarantee section

---

## ✅ DESIGN REQUIREMENTS

**Header must have**:
- ✅ Logo (emerald gradient "A" + ApexOS text)
- ✅ Navigation menu (desktop: inline, mobile: hamburger)
- ✅ Sign In button (secondary)
- ✅ Get Started button (primary, emerald)
- ✅ Sticky positioning
- ✅ Backdrop blur effect

**Footer must have**:
- ✅ 4 columns: Company, Product, Resources, Legal
- ✅ Social icons (Twitter, LinkedIn, GitHub)
- ✅ Email contact
- ✅ Copyright notice
- ✅ Risk disclosure (fintech compliance)

**Mobile responsive**:
- ✅ Hamburger menu on mobile
- ✅ Full-width buttons on mobile
- ✅ Proper spacing

---

## 🎨 CONSISTENCY RULES

**Colors** (match homepage):
- Background: `bg-zinc-950` to `bg-black`
- Text: `text-white` primary, `text-zinc-400` secondary
- Accent: `bg-emerald-600` for CTAs
- Borders: `border-zinc-800`

**Fonts**:
- Same as existing (inherit)

**Spacing**:
- Container: `container mx-auto px-4 sm:px-6 lg:px-8`
- Header height: `h-16`
- Footer padding: `py-12`

---

## 🚀 OUTPUT

Update 2 files:
1. `src/app/[locale]/landing/page.tsx`
2. `src/app/[locale]/payment/page.tsx`

Both should have:
- Professional header navigation
- Comprehensive footer
- Matching homepage design
- Mobile responsive
- Fintech-grade aesthetics

---

## ⚡ START NOW!

Begin with Landing page (simpler), then Pricing page.

**GO GO GO!** 🔥
