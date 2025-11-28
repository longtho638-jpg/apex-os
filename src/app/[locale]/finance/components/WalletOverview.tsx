import { Wallet } from '@/types/finance';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Wallet as WalletIcon, ArrowUpRight, Clock } from 'lucide-react';

interface WalletOverviewProps {
    wallet: Wallet | null;
    isLoading: boolean;
}

export function WalletOverview({ wallet, isLoading }: WalletOverviewProps) {
    if (isLoading) {
        return <div className="animate-pulse h-32 bg-gray-800 rounded-lg"></div>;
    }

    if (!wallet) {
        return <div className="text-red-500">Failed to load wallet</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 bg-gradient-to-br from-emerald-900/50 to-emerald-800/20 border-emerald-700/50">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-emerald-400 font-medium">Available Balance</h3>
                    <WalletIcon className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold text-white">
                    {formatCurrency(wallet.balance)} <span className="text-sm font-normal text-gray-400">{wallet.currency}</span>
                </div>
            </Card>

            <Card className="p-6 bg-gray-900/50 border-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-yellow-400 font-medium">Pending Payout</h3>
                    <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold text-white">
                    {formatCurrency(wallet.pending_payout)} <span className="text-sm font-normal text-gray-400">{wallet.currency}</span>
                </div>
            </Card>

            <Card className="p-6 bg-gray-900/50 border-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-blue-400 font-medium">Total Withdrawn</h3>
                    <ArrowUpRight className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-white">
                    {/* TODO: Calculate from transactions */}
                    -- <span className="text-sm font-normal text-gray-400">{wallet.currency}</span>
                </div>
            </Card>
        </div>
    );
}
