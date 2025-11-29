'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface PayoutRequest {
  id: string;
  user_id: string; // In real app, join with users table for name
  amount: number;
  status: 'pending' | 'paid' | 'rejected';
  method: string;
  wallet_address: string;
  created_at: string;
}

export default function AdminPayoutsPage() {
  const [requests, setRequests] = useState<PayoutRequest[]>([]);

  useEffect(() => {
    // Mock fetch
    const mockRequests: PayoutRequest[] = [
        { id: '1', user_id: 'user_123', amount: 150.00, status: 'pending', method: 'crypto', wallet_address: '0x123...abc', created_at: new Date().toISOString() },
        { id: '2', user_id: 'user_456', amount: 540.00, status: 'paid', method: 'crypto', wallet_address: '0x456...def', created_at: new Date(Date.now() - 86400000).toISOString() },
    ];
    setRequests(mockRequests);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>

        <div className="relative z-10 h-full overflow-y-auto p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white">Payout Requests</h1>
            <p className="text-zinc-400">Manage affiliate commission withdrawals.</p>
          </header>

          <GlassCard className="p-6">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-sm text-zinc-500 border-b border-white/10">
                            <th className="p-4">User</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Method</th>
                            <th className="p-4">Address</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((req) => (
                            <tr key={req.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-4 font-mono text-xs">{req.user_id}</td>
                                <td className="p-4 font-bold text-emerald-400">${req.amount.toFixed(2)}</td>
                                <td className="p-4 capitalize">{req.method}</td>
                                <td className="p-4 font-mono text-xs text-zinc-400">{req.wallet_address}</td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                                        req.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                                        req.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                        'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                        {req.status === 'paid' && <CheckCircle className="w-3 h-3" />}
                                        {req.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                        {req.status === 'pending' && <Clock className="w-3 h-3" />}
                                        {req.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    {req.status === 'pending' && (
                                        <div className="flex gap-2 justify-end">
                                            <button className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 rounded text-xs font-bold">Mark Paid</button>
                                            <button className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded text-xs font-bold">Reject</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
