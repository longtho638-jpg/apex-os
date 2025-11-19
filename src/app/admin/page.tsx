"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Users, DollarSign, Activity, Lock, Search, AlertTriangle, CheckCircle, Terminal, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/os/sidebar';

export default function AdminGodMode() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('users');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin123') {
            setIsAuthenticated(true);
        } else {
            setError('Access Denied: Invalid Credentials');
            setPassword('');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#050505] text-amber-500 font-mono">
                <div className="w-full max-w-md p-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-sm">
                    <div className="flex justify-center mb-6">
                        <Shield className="h-12 w-12" />
                    </div>
                    <h1 className="text-2xl font-bold text-center mb-2 tracking-wider">APEX GOD MODE</h1>
                    <p className="text-center text-amber-500/60 text-sm mb-8">Restricted Access Area. Level 5 Clearance Required.</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter Security Code"
                                className="w-full bg-black/50 border border-amber-500/30 rounded-lg px-4 py-3 text-center text-amber-500 focus:outline-none focus:border-amber-500 transition-all placeholder:text-amber-500/30"
                                autoFocus
                            />
                        </div>
                        {error && <div className="text-red-500 text-xs text-center font-bold">{error}</div>}
                        <button
                            type="submit"
                            className="w-full bg-amber-500 text-black font-bold py-3 rounded-lg hover:bg-amber-400 transition-colors"
                        >
                            AUTHENTICATE
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ...

    return (
        <div className="flex h-screen w-full bg-[#050505] text-gray-300 font-sans selection:bg-amber-500/30 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b border-amber-500/20 bg-[#0A0A0A] flex items-center justify-between px-8 sticky top-0 z-10 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <Shield className="h-6 w-6 text-amber-500" />
                        <span className="text-lg font-bold text-amber-500 tracking-widest">ADMIN CONSOLE</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono text-amber-500/60">
                        <span className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            SYSTEM SECURE
                        </span>
                        <span>|</span>
                        <span>ADMIN_ID: #001</span>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Tabs */}
                        <div className="flex gap-4 mb-8 border-b border-amber-500/10 pb-1">
                            <TabButton
                                active={activeTab === 'users'}
                                onClick={() => setActiveTab('users')}
                                icon={<Users className="h-4 w-4" />}
                                label="User Management"
                            />
                            <TabButton
                                active={activeTab === 'finance'}
                                onClick={() => setActiveTab('finance')}
                                icon={<DollarSign className="h-4 w-4" />}
                                label="Financial Reconciliation"
                            />
                            <TabButton
                                active={activeTab === 'system'}
                                onClick={() => setActiveTab('system')}
                                icon={<Activity className="h-4 w-4" />}
                                label="System Health"
                            />
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[500px]">
                            {activeTab === 'users' && <UserManagementTab />}
                            {activeTab === 'finance' && <FinancialTab />}
                            {activeTab === 'system' && <SystemHealthTab />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Sub-Components ---

function TabButton({ active, onClick, icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-t-lg font-medium transition-all relative top-1",
                active
                    ? "text-amber-500 border-b-2 border-amber-500 bg-amber-500/5"
                    : "text-gray-500 hover:text-amber-500/80 hover:bg-white/5"
            )}
        >
            {icon}
            {label}
        </button>
    );
}

function UserManagementTab() {
    const users = [
        { id: 'UID-001', name: 'Nguyen Van Hung', email: 'hung.whale@gmail.com', status: 'Active', volume: '$12.5M' },
        { id: 'UID-002', name: 'Tran Thi Linh', email: 'linh.kol@crypto.vn', status: 'Active', volume: '$4.2M' },
        { id: 'UID-003', name: 'Le Hoang Nam', email: 'nam.fund@capital.com', status: 'Active', volume: '$8.9M' },
        { id: 'UID-004', name: 'Pham Minh Tuan', email: 'tuan.bot@gmail.com', status: 'Banned', volume: '$0.00' },
        { id: 'UID-005', name: 'Doan Van Hau', email: 'hau.trader@yahoo.com', status: 'Active', volume: '$150K' },
        { id: 'UID-006', name: 'Sarah Jenkins', email: 'sarah.j@global.com', status: 'Active', volume: '$2.1M' },
        { id: 'UID-007', name: 'Michael Chen', email: 'm.chen@asia.net', status: 'Active', volume: '$5.6M' },
        { id: 'UID-008', name: 'Bot Network 01', email: 'bot01@scam.net', status: 'Banned', volume: '$12K' },
        { id: 'UID-009', name: 'Kevin Durant', email: 'kd.sniper@nba.com', status: 'Active', volume: '$3.4M' },
        { id: 'UID-010', name: 'Elon Musk', email: 'doge.father@x.com', status: 'Active', volume: '$42.0B' },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-amber-500 focus:outline-none"
                    />
                </div>
                <div className="text-sm text-gray-500">Total Users: <span className="text-white font-bold">1,248</span></div>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-gray-400">
                        <tr>
                            <th className="px-6 py-4 font-medium">UID</th>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Email</th>
                            <th className="px-6 py-4 font-medium">Volume (30d)</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-mono text-gray-500">{user.id}</td>
                                <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                                <td className="px-6 py-4 text-gray-400">{user.email}</td>
                                <td className="px-6 py-4 font-mono text-amber-500">{user.volume}</td>
                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "px-2 py-1 rounded text-xs font-bold",
                                        user.status === 'Active' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                    )}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-xs transition-colors">View</button>
                                    <button className="px-3 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs transition-colors">Ban</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function FinancialTab() {
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayout = () => {
        setIsProcessing(true);
        setTimeout(() => setIsProcessing(false), 3000);
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
                <div className="p-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex flex-col items-center justify-center text-center">
                    <div className="mb-4 p-4 rounded-full bg-amber-500/10">
                        <DollarSign className="h-8 w-8 text-amber-500" />
                    </div>
                    <h3 className="text-gray-400 font-medium mb-2">Total Commission Received</h3>
                    <div className="text-4xl font-bold text-white">$142,850.00</div>
                    <div className="text-sm text-green-500 mt-2">+12.4% vs last month</div>
                </div>

                <div className="p-8 rounded-2xl border border-red-500/20 bg-red-500/5 flex flex-col items-center justify-center text-center">
                    <div className="mb-4 p-4 rounded-full bg-red-500/10">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-gray-400 font-medium mb-2">Total Rebate Pending</h3>
                    <div className="text-4xl font-bold text-white">$85,200.00</div>
                    <div className="text-sm text-red-400 mt-2">Due in 2 days</div>
                </div>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={handlePayout}
                    disabled={isProcessing}
                    className={cn(
                        "group relative overflow-hidden rounded-xl px-12 py-6 font-bold text-xl transition-all",
                        isProcessing
                            ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                            : "bg-amber-500 text-black hover:scale-105 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]"
                    )}
                >
                    {isProcessing ? (
                        <span className="flex items-center gap-3">
                            <Activity className="h-6 w-6 animate-spin" />
                            PROCESSING BATCH PAYOUTS...
                        </span>
                    ) : (
                        <span className="flex items-center gap-3">
                            <DollarSign className="h-6 w-6" />
                            EXECUTE BATCH PAYOUT
                        </span>
                    )}
                </button>
            </div>

            {isProcessing && (
                <div className="text-center text-amber-500 animate-pulse font-mono text-sm">
                    &gt; Initiating blockchain transactions... <br />
                    &gt; Verifying wallet addresses... <br />
                    &gt; Broadcasting to network...
                </div>
            )}
        </div>
    );
}

function SystemHealthTab() {
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const agents = ['Collector', 'Auditor', 'Guardian', 'Concierge'];
            const actions = ['Syncing data...', 'Verifying hash...', 'Checking latency...', 'Optimizing route...', 'Heartbeat OK'];
            const agent = agents[Math.floor(Math.random() * agents.length)];
            const action = actions[Math.floor(Math.random() * actions.length)];
            const timestamp = new Date().toISOString().split('T')[1].split('.')[0];

            setLogs(prev => [`[${timestamp}] [${agent}] ${action}`, ...prev].slice(0, 15));
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid grid-cols-3 gap-8">
            {/* Agent Status Cards */}
            <div className="col-span-1 space-y-4">
                <AgentStatusCard name="The Collector" status="Online" uptime="99.9%" load="42%" />
                <AgentStatusCard name="The Auditor" status="Online" uptime="99.5%" load="12%" />
                <AgentStatusCard name="The Guardian" status="Online" uptime="100%" load="8%" />
                <AgentStatusCard name="The Concierge" status="Standby" uptime="98.2%" load="0%" color="text-yellow-500" />
            </div>

            {/* Console Log */}
            <div className="col-span-2 rounded-xl border border-white/10 bg-black p-6 font-mono text-sm h-[400px] flex flex-col">
                <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                    <Terminal className="h-4 w-4 text-amber-500" />
                    <span className="text-gray-400">System Logs</span>
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <div className="absolute inset-0 overflow-y-auto space-y-2">
                        {logs.map((log, i) => (
                            <div key={i} className="text-green-500/80 border-l-2 border-transparent hover:border-green-500 pl-2 transition-colors">
                                {log}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function AgentStatusCard({ name, status, uptime, load, color }: any) {
    return (
        <div className="p-4 rounded-lg border border-white/10 bg-white/5 flex items-center justify-between">
            <div>
                <div className="font-bold text-white">{name}</div>
                <div className="text-xs text-gray-500">Uptime: {uptime}</div>
            </div>
            <div className="text-right">
                <div className={cn("font-bold text-sm flex items-center gap-2 justify-end", color || "text-green-500")}>
                    <div className={cn("h-2 w-2 rounded-full", color ? "bg-yellow-500" : "bg-green-500")} />
                    {status}
                </div>
                <div className="text-xs text-gray-500">Load: {load}</div>
            </div>
        </div>
    );
}
