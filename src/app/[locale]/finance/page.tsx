'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/os/sidebar';
import { Wallet as WalletIcon, DollarSign } from 'lucide-react';
import { Wallet, Transaction, PaymentMethod } from '@/types/finance';
import { WalletOverview } from './components/WalletOverview';
import { TransactionTable } from './components/TransactionTable';
import { WithdrawalForm } from './components/WithdrawalForm';
import { PaymentMethodsList } from './components/PaymentMethodsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassCard } from '@/components/ui/glass-card';

export default function FinancePage() {
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [walletRes, txRes, pmRes] = await Promise.all([
                fetch('/api/v1/user/finance/wallet', { headers }),
                fetch('/api/v1/user/finance/transactions', { headers }),
                fetch('/api/v1/user/finance/payment-methods', { headers })
            ]);

            const walletData = await walletRes.json();
            const txData = await txRes.json();
            const pmData = await pmRes.json();

            if (walletData.success) setWallet(walletData.wallet);
            if (txData.success) setTransactions(txData.transactions);
            if (pmData.success) setPaymentMethods(pmData.methods);

        } catch (error) {
            console.error('Failed to load finance data', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-[#030303]/80 backdrop-blur-xl border-b border-white/10 p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <DollarSign className="h-7 w-7 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Financial Overview</h1>
                            <p className="text-sm text-zinc-400">Manage wallet, withdrawals & transactions</p>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-6xl mx-auto">
                        <WalletOverview wallet={wallet} isLoading={isLoading} />

                        <Tabs defaultValue="transactions" className="w-full mt-6">
                            <TabsList className="bg-white/5 border-white/10 mb-6">
                                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                                <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                                <TabsTrigger value="settings">Settings</TabsTrigger>
                            </TabsList>

                            <TabsContent value="transactions">
                                <GlassCard className="p-6">
                                    <h2 className="text-lg font-bold text-white mb-4">Transaction History</h2>
                                    <TransactionTable transactions={transactions} isLoading={isLoading} />
                                </GlassCard>
                            </TabsContent>

                            <TabsContent value="withdraw">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <GlassCard className="p-6">
                                        <h2 className="text-lg font-bold text-white mb-4">Request Withdrawal</h2>
                                        <WithdrawalForm
                                            balance={wallet?.balance || 0}
                                            paymentMethods={paymentMethods}
                                            onSuccess={fetchData}
                                        />
                                    </GlassCard>
                                    <GlassCard className="p-6">
                                        <h2 className="text-lg font-bold text-white mb-4">Important Notes</h2>
                                        <ul className="list-disc list-inside space-y-2 text-zinc-400">
                                            <li>Minimum withdrawal amount is 10 USDT.</li>
                                            <li>Withdrawals are processed within 24 hours.</li>
                                            <li>Ensure your payment method details are correct.</li>
                                            <li>Network fees may apply.</li>
                                        </ul>
                                    </GlassCard>
                                </div>
                            </TabsContent>

                            <TabsContent value="settings">
                                <GlassCard className="p-6 max-w-2xl">
                                    <PaymentMethodsList methods={paymentMethods} onUpdate={fetchData} />
                                </GlassCard>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    );
}
