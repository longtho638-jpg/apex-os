'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Zap,
    Users,
    Wallet,
    Settings,
    TrendingUp,
    Award,
    Bell,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';
import { WinStreakPopup } from '@/components/upsell/WinStreakPopup';
import { SupportChat } from '@/components/support/SupportChat';
import { MobileNav } from '@/components/layout/MobileNav';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';

const menuItems = [
    { href: '/en/dashboard/overview', icon: LayoutDashboard, label: 'Overview' },
    { href: '/en/dashboard/signals', icon: Zap, label: 'AI Signals' },
    { href: '/en/dashboard/trading', icon: TrendingUp, label: 'Trading' },
    { href: '/en/dashboard/wallet', icon: Wallet, label: 'Wallet' },
    { href: '/en/wolf-pack', icon: Users, label: 'Wolf Pack' },
    { href: '/en/studio', icon: Settings, label: 'Algo Studio' },
    { href: '/en/launchpad', icon: Zap, label: 'Launchpad' },
    { href: '/en/dao', icon: Award, label: 'DAO Governance' },
    { href: '/en/affiliate', icon: Users, label: 'Partner Program' },
    { href: '/en/dashboard/referrals', icon: Users, label: 'Referrals' },
    { href: '/en/dashboard/rewards', icon: Award, label: 'Rewards' },
    { href: '/en/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#030303]">
            {/* Mobile menu button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 h-full w-64 bg-[#0A0A0A] border-r border-white/10 z-40 transition-transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:block hidden
        `}
            >
                <div className="p-6">
                    <Link href="/" className="flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold">
                            A
                        </div>
                        <span className="text-xl font-bold text-white">ApexOS</span>
                    </Link>

                    <nav className="space-y-2">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                                        }
                  `}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User section */}
                    <div className="absolute bottom-6 left-6 right-6">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold">
                                    U
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white">User</p>
                                    <p className="text-xs text-zinc-500">PRO Plan</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-[#030303]/80 backdrop-blur-xl border-b border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1" />
                        <div className="flex items-center gap-4">
                            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors relative">
                                <Bell size={20} className="text-zinc-400" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <div className="p-6">
                    {children}
                </div>
            </main>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Bottom Nav */}
            <MobileNav />

            {/* PWA Install Prompt */}
            <InstallPrompt />

            {/* Interactive Onboarding Checklist */}
            {/* Note: OnboardingChecklist expects userId prop, we might need to fetch it or pass from context */}
            {/* For now, passing dummy or retrieving from context if available. Let's assume layout can access user session or child pages do. */}
            {/* Since this is a layout and we don't have user context readily available in this file without async/await or provider, */}
            {/* we will place placeholders. In a real app, wrap with SessionProvider. */}
            {/* <OnboardingChecklist userId="current-user-id" />  <-- This needs to be passed correctly */}

            {/* Global Components */}
            <WinStreakPopup />
            <SupportChat />
        </div>
    );
}
