'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    DollarSign,
    ShieldAlert,
    Activity,
    Users,
    Settings,
    LogOut,
    Zap,
    Network,
    Map as MapIcon,
    Hexagon // For Beehive/CRM
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';



export function AdminSidebar() {
    const pathname = usePathname();
    // Strip locale (e.g. /en/admin... -> /admin...)
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}\//, '/');
    const t = useTranslations('AdminSidebar');
    const [openSubmenu, setOpenSubmenu] = React.useState<string | null>('security');

    const navItems = [
        { name: t('overview'), href: '/admin/dashboard', icon: LayoutDashboard },
        { name: t('pricing'), href: '/admin/pricing', icon: DollarSign },
        { name: t('risk'), href: '/admin/risk', icon: ShieldAlert },
        { name: t('trading'), href: '/admin/trading', icon: Activity },
        { name: t('users'), href: '/admin/users', icon: Users },
        { name: 'Finance', href: '/admin/finance', icon: DollarSign }, // Added Finance
        { name: 'AI Signals', href: '/admin/signals', icon: Zap }, // Added Signals
        { name: t('strategy'), href: '/admin/strategy', icon: MapIcon }, // Added Strategy link
        { name: 'The Beehive (CRM)', href: '/admin/crm', icon: Hexagon }, // Added CRM
        { name: t('system'), href: '/admin/system', icon: Settings }, // Added System link
        {
            name: t('security'),
            href: '/admin/security',
            icon: Settings,
            children: [
                { name: t('ip_whitelist'), href: '/admin/security/ip-whitelist', icon: ShieldAlert },
                { name: t('mfa_setup'), href: '/admin/security/mfa/setup', icon: Zap },
                { name: t('audit_logs'), href: '/admin/security/audit-logs', icon: LayoutDashboard },
                { name: t('security_alerts'), href: '/admin/security/alerts', icon: ShieldAlert },
                { name: t('agent_status'), href: '/admin/agents', icon: Activity },
            ]
        },
        { name: t('exchanges'), href: '/admin/exchanges', icon: Network },
        {
            name: t('analytics'),
            href: '/admin/analytics',
            icon: Activity,
            children: [
                { name: t('dashboard'), href: '/admin/analytics-dashboard', icon: LayoutDashboard },
                { name: t('ab_tests'), href: '/admin/ab-tests', icon: Activity },
            ]
        },
        {
            name: t('growth'),
            href: '/admin/growth-hub',
            icon: Users,
            children: [
                { name: t('viral'), href: '/admin/viral-economics', icon: Users },
            ]
        },
        { name: t('liquidity'), href: '/admin/providers', icon: DollarSign },
    ];

    const toggleSubmenu = (name: string) => {
        setOpenSubmenu(prev => prev === name ? null : name);
    };

    return (
        <div className="w-64 h-screen bg-black border-r border-gray-800 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-2 text-[#00FF94]">
                    <Zap className="w-6 h-6 fill-current" />
                    <span className="text-xl font-bold tracking-wider">APEX<span className="text-white">GOD</span></span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00FF94] animate-pulse" />
                    <span className="text-xs text-gray-400 font-mono">{t('system_online')}</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathWithoutLocale === item.href ||
                        (item.children && pathWithoutLocale.startsWith(item.href)) ||
                        pathname === item.href; // Fallback
                    const hasChildren = item.children && item.children.length > 0;
                    const isOpen = openSubmenu === item.name || isActive;

                    return (
                        <div key={item.href}>
                            <Link
                                href={hasChildren ? '#' : item.href}
                                onClick={(e) => {
                                    if (hasChildren) {
                                        e.preventDefault();
                                        toggleSubmenu(item.name);
                                    }
                                }}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group justify-between",
                                    isActive && !hasChildren
                                        ? "bg-[#00FF94]/10 text-[#00FF94] border border-[#00FF94]/20"
                                        : "text-gray-400 hover:bg-gray-900 hover:text-white"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={cn("w-5 h-5", isActive ? "text-[#00FF94]" : "text-gray-500 group-hover:text-white")} />
                                    <span className="font-medium">{item.name}</span>
                                </div>
                                {hasChildren && (
                                    <div className={cn("transition-transform duration-200", isOpen ? "rotate-180" : "")}>
                                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                                {isActive && !hasChildren && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#00FF94] shadow-[0_0_8px_#00FF94]" />
                                )}
                            </Link>

                            {/* Submenu */}
                            {hasChildren && isOpen && (
                                <div className="ml-4 mt-1 space-y-1 border-l border-gray-800 pl-2">
                                    {item.children!.map((child) => {
                                        const isChildActive = pathname === child.href;
                                        return (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm",
                                                    isChildActive
                                                        ? "text-[#00FF94] bg-[#00FF94]/5"
                                                        : "text-gray-500 hover:text-white hover:bg-gray-900/50"
                                                )}
                                            >
                                                <child.icon className={cn("w-4 h-4", isChildActive ? "text-[#00FF94]" : "text-gray-600")} />
                                                <span>{child.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800">
                <div className="bg-gray-900/50 rounded-lg p-4 mb-4 border border-gray-800">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{t('cpu_load')}</span>
                        <span className="text-[#00FF94]">12%</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-[#00FF94] h-full w-[12%]" />
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 mt-3 mb-1">
                        <span>{t('memory')}</span>
                        <span className="text-blue-500">45%</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full w-[45%]" />
                    </div>
                </div>

                <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors w-full px-2 py-2 mb-2">
                    <LogOut className="w-4 h-4 rotate-180" />
                    <span className="text-sm">{t('back_to_app')}</span>
                </Link>

                <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors w-full px-2 py-2">
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">{t('disconnect')}</span>
                </button>
            </div>
        </div>
    );
}
