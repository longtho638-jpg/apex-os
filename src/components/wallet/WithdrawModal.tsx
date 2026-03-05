'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button3D } from '@/components/marketing/Button3D';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  available: number;
  onWithdrawn: () => void;
}

export function WithdrawModal({ isOpen, onClose, available, onWithdrawn }: WithdrawModalProps) {
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) return toast.error('Invalid Amount');
    if (amount > available) return toast.error('Insufficient Funds');

    const toastId = toast.loading('Broadcasting Transaction...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast.dismiss(toastId);
    toast.success('Withdrawal Sent', { description: `-${amount} USDT sent to external wallet.` });
    onWithdrawn();
    onClose();
    setWithdrawAmount('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Download className="text-red-500" /> Withdraw USDT
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Destination Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:border-red-500 outline-none"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-zinc-500">Amount</label>
                  <span className="text-xs text-zinc-400">Avail: ${available.toLocaleString()}</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:border-red-500 outline-none"
                  />
                  <button
                    onClick={() => setWithdrawAmount(available.toString())}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-white/10 px-2 py-1 rounded hover:bg-white/20"
                  >
                    MAX
                  </button>
                </div>
              </div>
              <Button3D full variant="danger" onClick={handleWithdraw}>
                Confirm Withdrawal
              </Button3D>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
