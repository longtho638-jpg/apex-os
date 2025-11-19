"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, LineChart, Shield, LogOut, Layers, Activity, Settings, Map } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Command Center', icon: LineChart, path: '/trade' },
    { name: 'Admin God Mode', icon: Shield, path: '/admin' },
];

const SECONDARY_ITEMS = [
    { name: 'Audit Reports', icon: Activity, path: '#' },
    { name: 'Architecture', icon: Layers, path: '#' },
    { name: 'Roadmap', icon: Map, path: '#' },
    { name: 'Settings', icon: Settings, path: '#' },
];

export function Sidebar() {
    const pathname = usePathname();

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
                <div className="text-xs font-bold text-gray-500 px-3 mb-2 uppercase tracking-wider">Platform</div>
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                                isActive
                                    ? "bg-[#00FF00]/10 text-[#00FF00] shadow-[0_0_10px_rgba(0,255,0,0.1)]"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className={cn("h-4 w-4", isActive ? "text-[#00FF00]" : "text-gray-500 group-hover:text-white")} />
                            {item.name}
                        </Link>
                    );
                })}

                <div className="mt-8 text-xs font-bold text-gray-500 px-3 mb-2 uppercase tracking-wider">System</div>
                {SECONDARY_ITEMS.map((item) => (
                    <button
                        key={item.name}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 group"
                    >
                        <item.icon className="h-4 w-4 text-gray-500 group-hover:text-white" />
                        {item.name}
                    </button>
                ))}
            </div>

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-white/5 mb-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#00FF00] to-blue-500" />
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">Demo User</div>
                        <div className="text-xs text-gray-500 truncate">Pro Plan</div>
                    </div>
                </div>
                <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full"
                >
                    <LogOut className="h-4 w-4" />
                    Log out
                </Link>
            </div>
        </div>
    );
}
