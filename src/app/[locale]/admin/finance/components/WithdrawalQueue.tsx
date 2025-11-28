import { useState } from 'react';
import { Withdrawal } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Check, X, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface WithdrawalQueueProps {
    withdrawals: (Withdrawal & { user: { email: string } })[];
    onUpdate: () => void;
}

export function WithdrawalQueue({ withdrawals, onUpdate }: WithdrawalQueueProps) {
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [txHash, setTxHash] = useState('');
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<string | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

    const handleAction = async () => {
        if (!selectedWithdrawal || !actionType) return;

        setProcessingId(selectedWithdrawal);
        try {
            const endpoint = actionType === 'approve' ? 'approve' : 'reject';
            const body = actionType === 'approve' ? { tx_hash: txHash } : { reason: rejectReason };

            const res = await fetch(`/api/v1/admin/finance/withdrawals/${selectedWithdrawal}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (data.success) {
                toast.success(`Withdrawal ${actionType}d successfully`);
                onUpdate();
                setSelectedWithdrawal(null);
                setActionType(null);
                setTxHash('');
                setRejectReason('');
            } else {
                toast.error(data.message || 'Action failed');
            }
        } catch (e) {
            toast.error('Error processing request');
        } finally {
            setProcessingId(null);
        }
    };

    if (withdrawals.length === 0) {
        return <div className="text-center py-8 text-gray-400">No pending withdrawals</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-gray-800/50 text-gray-200 uppercase font-medium">
                    <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">User</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Method</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {withdrawals.map((w) => (
                        <tr key={w.id} className="hover:bg-gray-800/30 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">{formatDate(w.created_at)}</td>
                            <td className="px-4 py-3">{w.user?.email}</td>
                            <td className="px-4 py-3 font-medium text-white">{formatCurrency(w.amount)}</td>
                            <td className="px-4 py-3">
                                <div className="flex flex-col">
                                    <span className="text-white font-medium">{w.payment_method_snapshot?.network}</span>
                                    <span className="text-xs font-mono">{w.payment_method_snapshot?.address}</span>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-right space-x-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            size="sm"
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                            onClick={() => { setSelectedWithdrawal(w.id); setActionType('approve'); }}
                                        >
                                            <Check className="w-4 h-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-gray-900 border-gray-800 text-white">
                                        <DialogHeader><DialogTitle>Approve Withdrawal</DialogTitle></DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <p>Confirm transfer of <b>{formatCurrency(w.amount)}</b> to:</p>
                                            <div className="bg-gray-800 p-3 rounded text-sm font-mono break-all">
                                                {w.payment_method_snapshot?.address}
                                            </div>
                                            <div className="space-y-2">
                                                <label>Transaction Hash (Optional)</label>
                                                <Input
                                                    placeholder="0x..."
                                                    value={txHash}
                                                    onChange={(e) => setTxHash(e.target.value)}
                                                />
                                            </div>
                                            <Button onClick={handleAction} disabled={!!processingId} className="w-full bg-emerald-600">
                                                Confirm Approval
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => { setSelectedWithdrawal(w.id); setActionType('reject'); }}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-gray-900 border-gray-800 text-white">
                                        <DialogHeader><DialogTitle>Reject Withdrawal</DialogTitle></DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <label>Reason for Rejection</label>
                                                <Input
                                                    placeholder="e.g. Invalid address"
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                />
                                            </div>
                                            <Button onClick={handleAction} disabled={!!processingId || !rejectReason} className="w-full bg-red-600">
                                                Confirm Rejection
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
