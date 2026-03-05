import {
  Award,
  BookOpen,
  Bot,
  Copy,
  CreditCard,
  FileText,
  LayoutDashboard,
  LineChart,
  Search,
  Settings,
  Shield,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: any;
  minTier?: string;
  requiresAdmin?: boolean;
}

export const NAV_ITEMS: MenuItem[] = [
  { id: 'overview', label: 'Dashboard', href: '/dashboard/overview', icon: LayoutDashboard },
  { id: 'signals', label: 'AI Signals', href: '/dashboard/signals', icon: Zap },
  { id: 'copy-trading', label: 'Copy Trading', href: '/copy-trading', icon: Copy },
  { id: 'marketplace', label: 'Marketplace', href: '/dashboard/marketplace', icon: Search },
  { id: 'trade', label: 'Trade', href: '/dashboard/trading', icon: TrendingUp }, // Unified to /dashboard/trading
  { id: 'wallet', label: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
  { id: 'pnl', label: 'PnL Tracker', href: '/pnl', icon: LineChart },
  { id: 'wolfpack', label: 'Wolf Pack', href: '/wolf-pack', icon: Bot, minTier: 'PRO' },
  { id: 'studio', label: 'Algo Studio', href: '/studio/editor', icon: Settings },
  { id: 'launchpad', label: 'Launchpad', href: '/launchpad', icon: Zap },
  { id: 'dao', label: 'DAO Governance', href: '/dao/governance', icon: Award },
  { id: 'rebates', label: 'Rebates', href: '/rebates', icon: Search },
  { id: 'referrals', label: 'Referrals', href: '/dashboard/affiliate', icon: Users },
  { id: 'reports', label: 'Reports', href: '/dashboard/reports', icon: FileText },
  { id: 'billing', label: 'Payment', href: '/dashboard/payment', icon: CreditCard },
  { id: 'resources', label: 'Resources', href: '/dashboard/resources', icon: BookOpen },
  { id: 'risk', label: 'Risk Guardian', href: '/dashboard/risk', icon: Shield, minTier: 'PRO' },
  { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: Settings },
  { id: 'admin', label: 'Admin Panel', href: '/admin', icon: Shield, requiresAdmin: true },
];
