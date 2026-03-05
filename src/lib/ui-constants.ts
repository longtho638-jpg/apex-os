/**
 * UI DESIGN SYSTEM - SINGLE SOURCE OF TRUTH
 *
 * All pages MUST use these constants for consistency.
 * Last updated: 2025-11-28
 */

// ============================================
// LAYOUT PATTERNS
// ============================================

export const LAYOUTS = {
  // Standard app layout with Sidebar
  appContainer: 'flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden',

  // Main content area
  mainContent: 'flex-1 relative overflow-hidden',

  // scrollable content wrapper
  contentWrapper: 'relative z-10 h-full flex flex-col overflow-y-auto',

  // Sticky header pattern
  stickyHeader: 'sticky top-0 z-30 bg-[#030303]/80 backdrop-blur-xl border-b border-white/10 p-6',

  // Page content area
  pageContent: 'p-6 space-y-6',
} as const;

// ============================================
// COLORS
// ============================================

export const COLORS = {
  // Backgrounds
  bg: {
    primary: 'bg-[#030303]', // Main app background
    secondary: 'bg-zinc-900', // Secondary backgrounds
    tertiary: 'bg-zinc-800', // Tertiary backgrounds
    glass: 'bg-white/5', // Glass effect base
    overlay: 'bg-black/80', // Modal overlays
  },

  // Text
  text: {
    primary: 'text-white', // Main text
    secondary: 'text-zinc-400', // Secondary text
    muted: 'text-zinc-500', // Muted text
    disabled: 'text-zinc-600', // Disabled text
  },

  // Semantic Colors
  success: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    solid: 'bg-emerald-500',
  },

  danger: {
    text: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    solid: 'bg-red-500',
  },

  info: {
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    solid: 'bg-blue-500',
  },

  warning: {
    text: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    solid: 'bg-yellow-500',
  },

  special: {
    text: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    solid: 'bg-purple-500',
  },

  // Borders
  border: {
    default: 'border-white/10',
    hover: 'border-white/20',
    focus: 'border-emerald-500/50',
  },
} as const;

// ============================================
// SPACING
// ============================================

export const SPACING = {
  // Page-level spacing
  page: {
    padding: 'p-6',
    gap: 'gap-6',
    spaceY: 'space-y-6',
  },

  // Card/Component spacing
  card: {
    padding: 'p-6',
    small: 'p-4',
    large: 'p-8',
  },

  // Section spacing
  section: {
    spaceY: 'space-y-8',
    marginY: 'my-8',
  },

  // Grid gaps
  grid: {
    default: 'gap-6',
    sm: 'gap-4',
    lg: 'gap-8',
  },
} as const;

// ============================================
// TYPOGRAPHY
// ============================================

export const TYPOGRAPHY = {
  // Page titles
  pageTitle: 'text-2xl font-bold',
  pageSubtitle: 'text-sm text-zinc-400',

  // Section titles
  sectionTitle: 'text-lg font-bold',

  // Card titles
  cardTitle: 'text-base font-bold',

  // Body text
  body: 'text-sm',
  bodySmall: 'text-xs',

  // Special
  caption: 'text-xs text-zinc-400',
  monospace: 'font-mono',

  // Numbers/metrics
  metric: 'text-3xl font-mono font-bold',
  metricSmall: 'text-2xl font-mono font-bold',
} as const;

// ============================================
// COMPONENTS
// ============================================

export const COMPONENTS = {
  // Buttons
  button: {
    primary:
      'px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    secondary: 'px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all',
    ghost: 'px-4 py-2 hover:bg-white/5 text-zinc-400 hover:text-white rounded-xl transition-all',
    danger:
      'px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all',
  },

  // Badges
  badge: {
    base: 'px-3 py-1.5 rounded-full text-xs font-medium',
    success: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400',
    danger: 'bg-red-500/10 border border-red-500/20 text-red-400',
    info: 'bg-blue-500/10 border border-blue-500/20 text-blue-400',
    warning: 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400',
  },

  // Icon containers
  iconContainer: {
    default: 'p-3 rounded-xl',
    success: 'p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20',
    danger: 'p-3 bg-red-500/10 rounded-xl border border-red-500/20',
    info: 'p-3 bg-blue-500/10 rounded-xl border border-blue-500/20',
    warning: 'p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20',
  },

  // Inputs
  input: {
    base: 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors',
    error:
      'w-full px-4 py-3 bg-red-500/5 border border-red-500/20 rounded-xl text-white focus:outline-none focus:border-red-500/50 transition-colors',
  },

  // Status indicators
  status: {
    online: 'w-2 h-2 bg-emerald-400 rounded-full animate-pulse',
    offline: 'w-2 h-2 bg-red-400 rounded-full',
    idle: 'w-2 h-2 bg-yellow-400 rounded-full',
  },
} as const;

// ============================================
// ANIMATIONS
// ============================================

export const ANIMATIONS = {
  // Framer Motion variants
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  fadeInUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' },
  },

  stagger: {
    container: {
      animate: {
        transition: {
          staggerChildren: 0.1,
        },
      },
    },
  },

  // Transitions
  transition: {
    default: 'transition-all duration-300 ease-out',
    fast: 'transition-all duration-200 ease-out',
    slow: 'transition-all duration-500 ease-out',
  },

  // Hover effects
  hover: {
    scale: 'hover:scale-105 transition-transform duration-200',
    scaleSmall: 'hover:scale-102 transition-transform duration-200',
    glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-shadow duration-300',
  },
} as const;

// ============================================
// RESPONSIVE BREAKPOINTS
// ============================================

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Combine multiple class names safely
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get full layout classes for standard app page
 */
export function getAppLayout() {
  return {
    container: LAYOUTS.appContainer,
    main: LAYOUTS.mainContent,
    wrapper: LAYOUTS.contentWrapper,
    header: LAYOUTS.stickyHeader,
    content: LAYOUTS.pageContent,
  };
}

/**
 * Get header classes with icon and badge
 */
export function getHeaderWithBadge(variant: 'success' | 'danger' | 'info' | 'warning' = 'success') {
  return {
    container: LAYOUTS.stickyHeader,
    iconContainer: COMPONENTS.iconContainer[variant],
    title: TYPOGRAPHY.pageTitle,
    subtitle: TYPOGRAPHY.pageSubtitle,
    badge: COMPONENTS.badge[variant],
  };
}

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// Example 1: Standard page structure
<div className={LAYOUTS.appContainer}>
  <Sidebar />
  <main className={LAYOUTS.mainContent}>
    <AuroraBackground />
    <div className={LAYOUTS.contentWrapper}>
      <header className={LAYOUTS.stickyHeader}>
        <h1 className={TYPOGRAPHY.pageTitle}>Page Title</h1>
        <p className={TYPOGRAPHY.pageSubtitle}>Subtitle</p>
      </header>
      <div className={LAYOUTS.pageContent}>
        <GlassCard className={SPACING.card.padding}>
          Content
        </GlassCard>
      </div>
    </div>
  </main>
</div>

// Example 2: Using helper function
const layout = getAppLayout();
<div className={layout.container}>
  <Sidebar />
  <main className={layout.main}>
    <AuroraBackground />
    <div className={layout.wrapper}>
      <header className={layout.header}>
        ...
      </header>
      <div className={layout.content}>
        ...
      </div>
    </div>
  </main>
</div>

// Example 3: Metric card
<GlassCard className={cn(SPACING.card.padding, ANIMATIONS.hover.scaleSmall)}>
  <div className="flex items-center justify-between mb-3">
    <p className={TYPOGRAPHY.caption}>Active Users</p>
    <div className={COMPONENTS.iconContainer.info}>
      <Users className="w-5 h-5" />
    </div>
  </div>
  <p className={TYPOGRAPHY.metric}>1,247</p>
  <p className={cn(COLORS.success.text, TYPOGRAPHY.bodySmall)}>+12% from yesterday</p>
</GlassCard>
*/

export default {
  LAYOUTS,
  COLORS,
  SPACING,
  TYPOGRAPHY,
  COMPONENTS,
  ANIMATIONS,
  BREAKPOINTS,
  cn,
  getAppLayout,
  getHeaderWithBadge,
};
