'use client';

import { useEffect, useState } from 'react';
import { Withdrawal } from '@/types/finance';
import { WithdrawalQueue } from './components/WithdrawalQueue';
import { GlassCard } from '@/components/ui/glass-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminFinancePage() {
    const [withdrawals, setWithdrawals] = useState<(Withdrawal & { user: { email: string } })[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-white mb-6">Financial Administration</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <GlassCard className="p-6 bg-gray-900 border-white/10">
                    <h3 className="text-zinc-400 font-medium mb-2">Pending Withdrawals</h3>
                    <div className="text-2xl font-bold text-white">{withdrawals.length}</div>
                </GlassCard>
                {/* Add more stats here */}
            </div>

            <Tabs defaultValue="queue" className="w-full">
                <TabsList className="bg-white/5 border-gray-800 mb-6">
                    <TabsTrigger value="queue">Payout Queue</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="queue">
                    <GlassCard className="bg-white/5 border-gray-800 p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Pending Requests</h2>
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
