"use client";

import React, { useState } from 'react';
import {
    Layers,
    Zap,
    Map,
    Settings,
    Activity,
    Shield,
    TrendingUp,
    Wallet,
    ChevronRight,
    Terminal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/os/sidebar';
import ZenWidget from '@/components/dashboard/ZenWidget';
import ConnectExchange from '@/components/dashboard/ConnectExchange';
import { usePnL, useRebates, useLeverage } from '@/hooks/useApi';

// Types
type Tab = 'dashboard' | 'audit' | 'architecture' | 'wolfpack' | 'roadmap' | 'settings';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [apiKey, setApiKey] = useState('');

    // Fetch real data from APIs
    const { data: pnlData, loading: pnlLoading } = usePnL();
    const { data: rebateData, loading: rebateLoading } = useRebates();
    const { data: leverageData, loading: leverageLoading } = useLeverage();

    return (
        <div className="flex h-screen w-full bg-[#0A0A0A] text-white font-sans overflow-hidden selection:bg-[#00FF00]/20">
            {/* 1. Shared Sidebar */}
            <Sidebar />

            {/* 2. Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0A0A0A]/50 backdrop-blur-md">
                    <h2 className="text-xl font-semibold capitalize">{activeTab.replace('-', ' ')}</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00FF00]/10 border border-[#00FF00]/20">
                            <div className="h-2 w-2 rounded-full bg-[#00FF00] animate-pulse" />
                            <span className="text-xs font-medium text-[#00FF00]">SYSTEM ONLINE</span>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    {activeTab === 'dashboard' && (
                        <div className="space-y-8 max-w-5xl mx-auto">
                            {/* Row 1: Metrics */}
                            <div className="grid grid-cols-3 gap-6">
                                <MetricCard
                                    label="TOTAL PNL (30D)"
                                    value={pnlLoading ? "Loading..." : `${(pnlData?.total_pnl ?? 0) >= 0 ? '+' : ''}$${(pnlData?.total_pnl ?? 0).toFixed(2)}`}
                                    change={pnlLoading ? "" : `${(pnlData?.win_rate ?? 0).toFixed(1)}% Win Rate`}
                                    isPositive={(pnlData?.total_pnl ?? 0) >= 0}
                                />
                                <MetricCard
                                    label="REBATES EARNED"
                                    value={rebateLoading ? "Loading..." : `$${(rebateData?.user_rebate ?? 0).toFixed(2)}`}
                                    subtext={rebateLoading ? "" : `${(rebateData?.rebate_percentage ?? 0).toFixed(0)}% of fees`}
                                    accentColor="text-blue-400"
                                />
                                <MetricCard
                                    label="RISK SCORE"
                                    value={leverageLoading ? "Loading..." : leverageData?.status === 'no_data' ? 'No Data' : leverageData?.is_over_leveraged ? 'High' : 'Low'}
                                    subtext="Guardian Active"
                                    accentColor={leverageData?.is_over_leveraged ? "text-red-400" : "text-[#00FF00]"}
                                />
                            </div>

                            {/* Row 2: Context & Alerts */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Shield className="h-5 w-5 text-[#00FF00]" />
                                        <h3 className="font-semibold">Guardian Alerts</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <AlertItem
                                            level="info"
                                            message="Margin utilization stable at 15%."
                                            time="10m ago"
                                        />
                                        <AlertItem
                                            level="success"
                                            message="No liquidation risk detected."
                                            time="1h ago"
                                        />
                                    </div>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <TrendingUp className="h-5 w-5 text-blue-400" />
                                        <h3 className="font-semibold">Market Context</h3>
                                    </div>
                                    <div className="space-y-2 text-sm text-gray-400">
                                        <div className="flex justify-between">
                                            <span>BTC Dominance</span>
                                            <span className="text-white">52.4%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Fear & Greed</span>
                                            <span className="text-[#00FF00]">Greed (74)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>24h Volume</span>
                                            <span className="text-white">$42B</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Row 2.5: Apex Zen Widget */}
                            <ZenWidget />

                            {/* Row 3: Connect Exchange Wizard */}
                            <ConnectExchange />
                        </div>
                    )}

                    {activeTab !== 'dashboard' && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <Layers className="h-16 w-16 mb-4 opacity-20" />
                            <p className="text-lg">Module Under Construction</p>
                        </div>
                    )}
                </div>
            </main>

            {/* 3. Right Panel: Agent Activity */}
            <aside className="w-80 border-l border-white/10 bg-[#0A0A0A] flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <Terminal className="h-5 w-5 text-gray-400" />
                        <span className="font-semibold">Agent Activity</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <AgentLog time="16:13:54" agent="Auditor" message="Calculating Daily PnL" color="text-yellow-400" />
                    <AgentLog time="16:13:52" agent="Collector" message="Syncing Wallet Balance" color="text-blue-400" />
                    <AgentLog time="16:13:52" agent="Guardian" message="Sentiment Analysis: Neutral" color="text-[#00FF00]" />
                    <AgentLog time="16:13:08" agent="Guardian" message="API Key Permission Check: Read-only" color="text-[#00FF00]" />
                    <AgentLog time="16:12:00" agent="Collector" message="Syncing Wallet Balance" color="text-blue-400" />
                    <AgentLog time="16:11:40" agent="Guardian" message="Sentiment Analysis: Neutral" color="text-[#00FF00]" />
                    <AgentLog time="16:11:38" agent="Auditor" message="Reconciling Fee vs Rebate" color="text-yellow-400" />
                </div>
            </aside>
        </div>
    );
}

// Helper Components

function MetricCard({ label, value, change, subtext, isPositive, accentColor }: any) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 flex flex-col justify-between hover:border-white/20 transition-colors">
            <span className="text-xs font-bold text-gray-500 tracking-wider">{label}</span>
            <div className="mt-4">
                <div className="text-3xl font-bold tracking-tight">{value}</div>
                <div className="flex items-center gap-2 mt-1">
                    {change && (
                        <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded", isPositive ? "bg-[#00FF00]/20 text-[#00FF00]" : "bg-red-500/20 text-red-500")}>
                            {change}
                        </span>
                    )}
                    {subtext && <span className={cn("text-xs", accentColor || "text-gray-400")}>{subtext}</span>}
                </div>
            </div>
        </div>
    );
}

function AlertItem({ level, message, time }: { level: 'info' | 'success' | 'warning', message: string, time: string }) {
    const color = level === 'success' ? 'text-[#00FF00]' : level === 'warning' ? 'text-yellow-400' : 'text-blue-400';
    return (
        <div className="flex items-start gap-3 text-sm">
            <div className={cn("mt-1 h-1.5 w-1.5 rounded-full", level === 'success' ? "bg-[#00FF00]" : level === 'warning' ? "bg-yellow-400" : "bg-blue-400")} />
            <div className="flex-1">
                <p className="text-gray-300">{message}</p>
                <p className="text-xs text-gray-600 mt-0.5">{time}</p>
            </div>
        </div>
    );
}

function AgentLog({ time, agent, message, color }: { time: string, agent: string, message: string, color: string }) {
    return (
        <div className="flex gap-3 text-xs font-mono">
            <span className="text-gray-600 flex-shrink-0">{time}</span>
            <div>
                <span className={cn("font-bold mr-2", color)}>[{agent}]</span>
                <span className="text-gray-400">{message}</span>
            </div>
        </div>
    );
}
