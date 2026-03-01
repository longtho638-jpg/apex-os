"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter as useNextRouter, usePathname as useNextPathname, useParams } from 'next/navigation';
import {
    LayoutDashboard, LineChart, Shield, LogOut, Activity,
    Settings, Bot, Search, Users, FileText, CreditCard, BookOpen, Crown, Zap, Lock,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserTier, type MenuId } from '@/hooks/useUserTier';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { TierId } from '@apex-os/vibe-payment';
import { useGamification } from '@/hooks/useGamification';

import { NAV_ITEMS } from '@/config/navigation';

export function Sidebar() {
    const params = useParams();
    const locale = params?.locale as string || 'en';
    const pathname = useNextPathname();
    const router = useNextRouter();
    const { user } = useAuth();
    const { tier, canViewMenu, isFree, loading } = useUserTier();
    const { level, xp, nextLevelXp } = useGamification();
    const t = useTranslations('Sidebar');
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    // Filter menu items based on tier
    const visibleItems = NAV_ITEMS.filter(item => canViewMenu(item.id as MenuId));

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
            className={cn(
                "flex flex-col h-full glass-panel rounded-2xl overflow-hidden transition-all duration-300 relative group/sidebar",
                isCollapsed ? "w-[80px]" : "w-[260px]"
            )}
        >
            {/* Collapse Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-24 z-50 bg-zinc-800 border border-white/10 rounded-full p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all opacity-0 group-hover/sidebar:opacity-100 translate-x-0"
            >
                {isCollapsed ? <Users className="w-3 h-3 rotate-180" /> : <Users className="w-3 h-3" />}
                {/* Using Users icon temporarily as chevron, actually let's import ChevronLeft/Right properly if not available, 
                    but lucide-react was imported. Let's check imports. 
                    Wait, I need to add ChevronLeft/Right to imports first. 
                    For now, I'll use a simple div or existing icon if I can't change imports in this block easily without re-reading.
                    Actually, I can just update the whole file content or use existing icons.
                    Let's use 'Menu' or similar if Chevron is missing, OR better, I will update imports in a separate block or just assume they are there?
                    No, I should update imports. 
                    
                    Let's use a separate replace for imports or just rewrite the whole file to be safe and clean.
                    The file is small enough.
                */}
            </button>

            {/* Logo Area */}
            <div className={cn(
                "h-20 flex items-center border-b border-white/5 bg-white/[0.02] transition-all duration-300",
                isCollapsed ? "justify-center px-0" : "px-6"
            )}>
                <div className={cn(
                    "h-10 w-10 bg-gradient-to-br from-[#00FF94] to-[#06B6D4] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,255,148,0.3)] shrink-0",
                    isCollapsed ? "mr-0" : "mr-3"
                )}>
                    <div className="h-5 w-5 bg-black transform rotate-45" />
                </div>
                {!isCollapsed && (
                    <span className="text-2xl font-bold tracking-tighter text-white whitespace-nowrap overflow-hidden">
                        APEX<span className="text-gradient-primary">OS</span>
                    </span>
                )}
            </div>

            {/* Main Navigation */}
            <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
                {!loading && (
                    <>
                        {!isCollapsed && (
                            <div className="text-[10px] font-bold text-gray-500 px-3 mb-3 uppercase tracking-[0.2em] whitespace-nowrap">
                                {t('platform')}
                            </div>
                        )}

                        {visibleItems.map((item) => {
                            // Remove locale prefix from pathname for comparison
                            const pathnameWithoutLocale = pathname?.replace(`/${locale}`, '') || '';
                            const isActive = pathnameWithoutLocale === item.href || pathnameWithoutLocale.startsWith(item.href + '/');
                            const isLocked = item.minTier && isFree;

                            return (
                                <Link
                                    key={item.href}
                                    href={`/${locale}${item.href}`}
                                    data-testid={`nav-${item.id}`}
                                    title={isCollapsed ? t(getTranslationKey(item.id)) : undefined}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden",
                                        isActive
                                            ? "bg-white/[0.08] text-[#00FF94] shadow-[0_0_20px_rgba(0,255,148,0.1)] border border-white/10"
                                            : "text-gray-400 hover:text-white hover:bg-white/[0.05] hover:translate-x-1",
                                        isCollapsed ? "justify-center" : ""
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00FF94] shadow-[0_0_10px_#00FF94]" />
                                    )}
                                    <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-[#00FF94]" : "text-gray-500 group-hover:text-white")} />

                                    {!isCollapsed && (
                                        <span className="relative z-10 whitespace-nowrap">{t(getTranslationKey(item.id))}</span>
                                    )}

                                    {isLocked && !isCollapsed && (
                                        <Crown className="h-3 w-3 text-yellow-500 ml-auto animate-pulse" />
                                    )}
                                </Link>
                            );
                        })}
                    </>
                )}
            </div>

            {/* Upgrade CTA for Free Users */}
            {isFree && !loading && (
                <div className="px-3 pb-4">
                    <Link
                        href={`/${locale}/dashboard/payment`}
                        className={cn(
                            "w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg relative overflow-hidden group bg-gradient-to-r from-[#00FF94] to-[#06B6D4] text-black hover:shadow-[0_0_20px_rgba(0,255,148,0.4)]",
                            isCollapsed ? "px-0" : "px-4"
                        )}
                        title={isCollapsed ? "Upgrade to Pro" : undefined}
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <Zap size={18} className="relative z-10 fill-black shrink-0" />
                        {!isCollapsed && (
                            <span className="text-sm relative z-10 whitespace-nowrap">
                                Upgrade to Pro
                            </span>
                        )}
                    </Link>
                </div>
            )}

            {/* User Profile & Logout */}
            <div className="p-3 border-t border-white/5 bg-white/[0.02]">
                <div className={cn(
                    "flex flex-col gap-3 py-3 rounded-xl bg-white/5 mb-2 border border-white/5",
                    isCollapsed ? "justify-center px-0 bg-transparent border-0" : "px-3"
                )}>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-black shadow-lg shrink-0",
                            !isFree
                                ? "bg-gradient-to-br from-[#00FF94] to-[#06B6D4]"
                                : "bg-gradient-to-br from-gray-400 to-gray-600"
                        )}>
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-white truncate flex items-center gap-1">
                                    {user?.email?.split('@')[0] || 'User'}
                                    {!isFree && <Crown className="h-3 w-3 text-[#00FF94]" />}
                                </div>
                                <div className="text-[10px] text-gray-400 truncate uppercase tracking-wider flex justify-between">
                                    <span>{tier}</span>
                                    <span className="text-emerald-400">LVL {level}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* XP Bar */}
                    {!isCollapsed && (
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-1000"
                                style={{ width: `${(xp / nextLevelXp) * 100}%` }}
                            />
                        </div>
                    )}
                </div>
                <button
                    onClick={handleLogout}
                    title={isCollapsed ? t('logout') : undefined}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 w-full group",
                        isCollapsed ? "justify-center" : ""
                    )}
                >
                    <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform shrink-0" />
                    {!isCollapsed && t('logout')}
                </button>
            </div>

            {/* Toggle Button (Bottom or Absolute) - Let's put it absolute on the border */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-50 bg-[#111] border border-white/20 rounded-full p-1.5 text-zinc-400 hover:text-[#00FF94] hover:border-[#00FF94] transition-all opacity-0 group-hover/sidebar:opacity-100 shadow-xl"
            >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>
        </aside>
    );
}
