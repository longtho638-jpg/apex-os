'use client';

import { RealtimeWallet } from '@/components/dashboard/RealtimeWallet';

export default function WalletPage() {
    // TODO: Get from auth session
    const userId = 'demo-user-id';

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Wallet</h1>
            <RealtimeWallet userId={userId} />
        </div>
    );
}
