'use client';

import { useEffect, useState } from 'react';
import { Withdrawal } from '@/types/finance';
import { WithdrawalQueue } from './components/WithdrawalQueue';
import { GlassCard } from '@/components/ui/glass-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Activity, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminFinancePage() {
    const [withdrawals, setWithdrawals] = useState<(Withdrawal & { user: { email: string } })[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // Mock metrics from God Mode (replace with real API later)
    const metrics = {
        totalFees: 12450.00,
        totalRebates: 4200.00,
        pendingRebates: 842.50
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/v1/admin/finance/withdrawals?status=pending', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setWithdrawals(data.withdrawals);
            }
        } catch (error) {
            console.error('Failed to load admin finance data', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePayout = () => {
        setIsProcessing(true);
        setTimeout(() => setIsProcessing(false), 3000);
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-white mb-6">Financial Administration</h1>

            {/* God Mode Financial Overview */}
            <div className="space-y-8 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GlassCard className="p-6 bg-amber-500/5 border-amber-500/20">
                        <div className="text-sm text-zinc-400 mb-1">Total Fees Collected</div>
                        <div className="text-2xl font-bold text-emerald-500">${metrics.totalFees.toFixed(2)}</div>
                    </GlassCard>
                    <GlassCard className="p-6 bg-amber-500/5 border-amber-500/20">
                        <div className="text-sm text-zinc-400 mb-1">Rebates Distributed</div>
                        <div className="text-2xl font-bold text-blue-500">${metrics.totalRebates.toFixed(2)}</div>
                    </GlassCard>
                    <GlassCard className="p-6 bg-amber-500/5 border-amber-500/20">
                        <div className="text-sm text-zinc-400 mb-1">Apex Profit</div>
                        <div className="text-2xl font-bold text-amber-500">${(metrics.totalFees - metrics.totalRebates).toFixed(2)}</div>
                    </GlassCard>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <GlassCard className="p-8 bg-amber-500/5 border-amber-500/20 flex flex-col items-center justify-center text-center">
                        <div className="mb-4 p-4 rounded-full bg-amber-500/10">
                            <DollarSign className="h-8 w-8 text-amber-500" />
                        </div>
                        <h3 className="text-zinc-400 font-medium mb-2">Total Commission Received</h3>
                        <div className="text-4xl font-bold text-white">${metrics.totalFees.toFixed(2)}</div>
                        <div className="text-sm text-emerald-500 mt-2">+12.4% vs last month</div>
                    </GlassCard>

                    <GlassCard className="p-8 bg-red-500/5 border-red-500/20 flex flex-col items-center justify-center text-center">
                        <div className="mb-4 p-4 rounded-full bg-red-500/10">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-zinc-400 font-medium mb-2">Total Rebate Pending</h3>
                        <div className="text-4xl font-bold text-white">${metrics.pendingRebates.toFixed(2)}</div>
                        <div className="text-sm text-red-400 mt-2">Due in 2 days</div>
                    </GlassCard>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handlePayout}
                        disabled={isProcessing}
                        className={cn(
                            "group relative overflow-hidden rounded-xl px-12 py-6 font-bold text-xl transition-all w-full md:w-auto",
                            isProcessing
                                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                : "bg-amber-500 text-black hover:scale-105 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]"
                        )}
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center gap-3">
                                <Activity className="h-6 w-6 animate-spin" />
                                PROCESSING BATCH PAYOUTS...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-3">
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

            <Tabs defaultValue="queue" className="w-full">
                <TabsList className="bg-white/5 border-gray-800 mb-6">
                    <TabsTrigger value="queue">Payout Queue</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="queue">
                    <GlassCard className="bg-white/5 border-gray-800 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-white">Pending Requests</h2>
                            <span className="text-zinc-400 text-sm">{withdrawals.length} pending</span>
                        </div>
                        <WithdrawalQueue withdrawals={withdrawals} onUpdate={fetchData} />
                    </GlassCard>
                </TabsContent>

                <TabsContent value="history">
                    <div className="text-zinc-400 p-4">History view coming soon...</div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
