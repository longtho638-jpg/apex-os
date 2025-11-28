"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter as useNextRouter, usePathname as useNextPathname, useParams } from 'next/navigation';
import {
    LayoutDashboard, LineChart, Shield, LogOut, Activity,
    Settings, Bot, Search, Users, FileText, CreditCard, BookOpen, Crown, Zap, Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserTier, type MenuId } from '@/hooks/useUserTier';
import { useUpgradeTier } from '@/hooks/useUpgradeTier';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/contexts/I18nContext';

// Menu configuration with tier requirements
const NAV_ITEMS: Array<{
    id: MenuId;
    name: string;
    icon: any;
    path: string;
    requiresFounders?: boolean;
    requiresAdmin?: boolean;
}> = [
        { id: 'overview', name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'trade', name: 'Trade', icon: Activity, path: '/trade' },
        { id: 'pnl', name: 'PnL Tracker', icon: LineChart, path: '/pnl' },
        { id: 'wolfpack', name: 'Wolf Pack', icon: Bot, path: '/wolf-pack', requiresFounders: true },
        { id: 'rebates', name: 'Rebates', icon: Search, path: '/rebates' },
        { id: 'risk', name: 'Risk Guardian', icon: Shield, path: '/risk', requiresFounders: true },
        { id: 'referrals', name: 'Referrals', icon: Users, path: '/referral' },
        { id: 'reports', name: 'Reports', icon: FileText, path: '/reports' },
        { id: 'billing', name: 'Payment', icon: CreditCard, path: '/payment' },
        { id: 'resources', name: 'Resources', icon: BookOpen, path: '/resources' },
        { id: 'settings', name: 'Settings', icon: Settings, path: '/settings' },
        { id: 'admin', name: 'Admin Panel', icon: Shield, path: '/admin', requiresAdmin: true },
    ];

export function Sidebar() {
    const params = useParams();
    const locale = params?.locale as string || 'en';
    const pathname = useNextPathname();
    const router = useNextRouter();
    const { user } = useAuth();
    const { tier, slot, canViewMenu, isFree, isFounders, loading, foundersSlotsLeft } = useUserTier();
    const { upgradeToFounders, isLoading: isUpgrading, error: upgradeError, success: upgradeSuccess } = useUpgradeTier();
    const t = useTranslations('Sidebar');

    // Filter menu items based on tier
    const visibleItems = NAV_ITEMS.filter(item => canViewMenu(item.id));

    const handleLogout = () => {
        localStorage.clear();
        router.push(`/${locale}/login`);
    };

    // Map ID to translation key
    const getTranslationKey = (id: string) => {
        if (id === 'overview') return 'dashboard';
        return id;
    };

    return (
        <aside
            role="navigation"
            data-testid="sidebar-navigation"
            className="w-[260px] flex flex-col h-full glass-panel m-4 rounded-2xl overflow-hidden transition-all duration-300"
        >
            {/* Logo Area */}
            <div className="h-20 flex items-center px-6 border-b border-white/5 bg-white/[0.02]">
                <div className="h-10 w-10 bg-gradient-to-br from-[#00FF94] to-[#06B6D4] rounded-lg flex items-center justify-center mr-3 shadow-[0_0_20px_rgba(0,255,148,0.3)]">
                    <div className="h-5 w-5 bg-black transform rotate-45" />
                </div>
                <span className="text-2xl font-bold tracking-tighter text-white">
                    APEX<span className="text-gradient-primary">OS</span>
                </span>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                {!loading && (
                    <>
                        <div className="text-[10px] font-bold text-gray-500 px-3 mb-3 uppercase tracking-[0.2em]">
                            {t('platform')}
                        </div>

                        {visibleItems.map((item) => {
                            // Remove locale prefix from pathname for comparison
                            const pathnameWithoutLocale = pathname?.replace(`/${locale}`, '') || '';
                            const isActive = pathnameWithoutLocale === item.path;

                            return (
                                <Link
                                    key={item.path + item.name}
                                    href={`/${locale}${item.path}`}
                                    data-testid={`nav-${item.id}`}
                                    data-founders-only={item.requiresFounders ? 'true' : 'false'}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden",
                                        isActive
                                            ? "bg-white/[0.08] text-[#00FF94] shadow-[0_0_20px_rgba(0,255,148,0.1)] border border-white/10"
                                            : "text-gray-400 hover:text-white hover:bg-white/[0.05] hover:translate-x-1"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00FF94] shadow-[0_0_10px_#00FF94]" />
                                    )}
                                    <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-[#00FF94]" : "text-gray-500 group-hover:text-white")} />
                                    <span className="relative z-10">{t(getTranslationKey(item.id))}</span>
                                    {item.requiresFounders && isFree && (
                                        <Crown className="h-3 w-3 text-yellow-500 ml-auto animate-pulse" />
                                    )}
                                </Link>
                            );
                        })}
                    </>
                )}

                {loading && (
                    <div className="text-center text-gray-500 text-sm py-4 animate-pulse">
                        {t('loading_menu')}
                    </div>
                )}
            </div>

            {/* Upgrade CTA for Free Users */}
            {isFree && !loading && (
                <div className="px-4 pb-4">
                    {foundersSlotsLeft > 0 ? (
                        <>
                            <button
                                onClick={async () => {
                                    if (!user?.id) return;
                                    const result = await upgradeToFounders(user.id);
                                    if (result) {
                                        setTimeout(() => window.location.reload(), 1500);
                                    }
                                }}
                                disabled={isUpgrading || upgradeSuccess}
                                className={cn(
                                    "w-full font-bold py-4 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg relative overflow-hidden group",
                                    upgradeSuccess
                                        ? "bg-emerald-500 text-white cursor-default"
                                        : "bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-black hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                                )}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                {isUpgrading ? (
                                    <Activity className="h-5 w-5 animate-spin relative z-10" />
                                ) : upgradeSuccess ? (
                                    <Crown className="h-5 w-5 relative z-10" />
                                ) : (
                                    <Zap size={18} className="relative z-10 fill-black" />
                                )}
                                <span className="text-sm relative z-10">
                                    {isUpgrading ? t('processing') : upgradeSuccess ? t('welcome_founder') : t('upgrade_to_founders')}
                                </span>
                            </button>
                            {upgradeError && (
                                <div className="text-center mt-2 text-xs text-red-500 font-medium">
                                    {upgradeError}
                                </div>
                            )}
                            {!upgradeSuccess && !upgradeError && (
                                <div className="text-center mt-3 text-xs text-zinc-500 font-mono">
                                    {t('spots_left').replace('13', String(foundersSlotsLeft))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full font-bold py-4 px-4 rounded-xl bg-zinc-800 text-zinc-500 flex items-center justify-center gap-2 cursor-not-allowed border border-zinc-700">
                            <Lock size={18} />
                            <span className="text-sm">Founders Sold Out</span>
                        </div>
                    )}
                </div>
            )}

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 mb-2 border border-white/5">
                    <div className={cn(
                        "h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-black shadow-lg",
                        isFounders
                            ? "bg-gradient-to-br from-[#00FF94] to-[#06B6D4]"
                            : "bg-gradient-to-br from-gray-400 to-gray-600"
                    )}>
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate flex items-center gap-1">
                            {user?.email?.split('@')[0] || 'User'}
                            {isFounders && <Crown className="h-3 w-3 text-[#00FF94]" />}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate uppercase tracking-wider">
                            {isFounders ? t('tier_founder').replace('#{slot}', String(slot)) : tier === 'admin' ? t('tier_admin') : t('tier_free')}
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 w-full group"
                >
                    <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    {t('logout')}
                </button>
            </div>
        </aside>
    );
}
