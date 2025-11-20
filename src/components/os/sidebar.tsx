"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, LineChart, Shield, LogOut, Activity,
    Settings, Bot, Search, Users, FileText, CreditCard, BookOpen, Crown, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserTier, type MenuId } from '@/hooks/useUserTier';
import { useAuth } from '@/contexts/AuthContext';

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
        { id: 'pnl', name: 'PnL Tracker', icon: LineChart, path: '/dashboard' }, // TODO: Create separate page
        { id: 'wolfpack', name: 'Wolf Pack', icon: Bot, path: '/dashboard', requiresFounders: true },
        { id: 'audit', name: 'Fee Audit', icon: Search, path: '/dashboard', requiresFounders: true },
        { id: 'guardian', name: 'Risk Guardian', icon: Shield, path: '/dashboard', requiresFounders: true },
        { id: 'referrals', name: 'Referrals', icon: Users, path: '/dashboard' }, // Teaser for free
        { id: 'reports', name: 'Reports', icon: FileText, path: '/dashboard' },
        { id: 'billing', name: 'Billing', icon: CreditCard, path: '/dashboard', requiresFounders: true },
        { id: 'resources', name: 'Resources', icon: BookOpen, path: '/dashboard' },
        { id: 'settings', name: 'Settings', icon: Settings, path: '/dashboard' },
        { id: 'admin', name: 'Admin Panel', icon: Shield, path: '/admin', requiresAdmin: true },
    ];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const { tier, slot, canViewMenu, isFree, isFounders, loading } = useUserTier();

    // Filter menu items based on tier
    const visibleItems = NAV_ITEMS.filter(item => canViewMenu(item.id));

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    return (
        <div className="w-[240px] flex flex-col border-r border-white/10 bg-[#0A0A0A] h-full">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-white/10">
                <div className="h-8 w-8 bg-[#00FF00] rounded-sm flex items-center justify-center mr-3 shadow-[0_0_10px_rgba(0,255,0,0.5)]">
                    <div className="h-4 w-4 bg-black transform rotate-45" />
                </div>
                <span className="text-xl font-bold tracking-tighter text-white">
                    APEX<span className="text-[#00FF00]">OS</span>
                </span>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {!loading && (
                    <>
                        <div className="text-xs font-bold text-gray-500 px-3 mb-2 uppercase tracking-wider">
                            Platform
                        </div>

                        {visibleItems.map((item) => {
                            const isActive = pathname === item.path;
                            const isLocked = (item.requiresFounders && isFree) || (item.requiresAdmin && !isFounders);

                            return (
                                <Link
                                    key={item.path + item.name}
                                    href={item.path}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                                        isActive
                                            ? "bg-[#00FF00]/10 text-[#00FF00] shadow-[0_0_10px_rgba(0,255,0,0.1)]"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <item.icon className={cn("h-4 w-4", isActive ? "text-[#00FF00]" : "text-gray-500 group-hover:text-white")} />
                                    {item.name}
                                    {item.requiresFounders && isFree && (
                                        <Crown className="h-3 w-3 text-yellow-500 ml-auto" />
                                    )}
                                </Link>
                            );
                        })}
                    </>
                )}

                {loading && (
                    <div className="text-center text-gray-500 text-sm py-4">
                        Loading menu...
                    </div>
                )}
            </div>

            {/* Upgrade CTA for Free Users */}
            {isFree && !loading && (
                <div className="px-3 pb-4">
                    <button
                        onClick={() => router.push('/offer')}
                        className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Zap size={16} />
                        <span className="text-sm">Upgrade to Founders</span>
                    </button>
                    <div className="text-center mt-2 text-xs text-zinc-500">
                        13/100 spots left • $99
                    </div>
                </div>
            )}

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-white/5 mb-2">
                    <div className={cn(
                        "h-8 w-8 rounded-full",
                        isFounders
                            ? "bg-gradient-to-br from-emerald-500 to-cyan-500"
                            : "bg-gradient-to-br from-[#00FF00] to-blue-500"
                    )} />
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate flex items-center gap-1">
                            {user?.email?.split('@')[0] || 'User'}
                            {isFounders && <Crown className="h-3 w-3 text-emerald-500" />}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                            {isFounders ? `Founders #${slot}` : tier === 'admin' ? 'Admin' : 'Free Tier'}
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full"
                >
                    <LogOut className="h-4 w-4" />
                    Log out
                </button>
            </div>
        </div>
    );
}
