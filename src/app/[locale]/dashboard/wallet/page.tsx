'use client';

import { RealtimeWallet } from '@/components/dashboard/RealtimeWallet';
import { useAuth } from '@/contexts/AuthContext';

export default function WalletPage() {
    const { user } = useAuth();

    if (!user) {
        return <div className="p-4">Please log in to view your wallet.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Wallet</h1>
            <RealtimeWallet userId={user.id} />
        </div>
    );
}

