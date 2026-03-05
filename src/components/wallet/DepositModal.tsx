'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Copy, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button3D } from '@/components/marketing/Button3D';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposited: () => void;
}

export function DepositModal({ isOpen, onClose, onDeposited }: DepositModalProps) {
  const [depositStep, setDepositStep] = useState(0);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText('0x71C...9A21');
    toast.success('Address Copied');
  };

  const simulateDeposit = async () => {
    setDepositStep(1);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Scan
    setDepositStep(2);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Confirm

    // Mock API call to credit wallet
    // await fetch('/api/wallet/deposit', ...)

    toast.success('Deposit Confirmed', { description: '+1,000 USDT received.' });
    onDeposited();
    setTimeout(() => {
      onClose();
      setDepositStep(0);
    }, 1500);
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
              <Upload className="text-[#00FF94]" /> Deposit USDT
            </h2>

            {depositStep === 0 && (
              <div className="text-center space-y-6">
                <div className="bg-white p-4 rounded-xl inline-block">
                  {/* Mock QR */}
                  <div className="w-48 h-48 bg-black/10 flex items-center justify-center text-black font-mono text-xs">
                    [QR CODE PLACEHOLDER]
                  </div>
                </div>
                <div className="bg-black/50 p-3 rounded-lg flex items-center justify-between border border-white/10">
                  <code className="text-zinc-400 text-sm">0x71C...9A21</code>
                  <button onClick={handleCopyAddress}>
                    <Copy size={16} className="text-zinc-500 hover:text-white" />
                  </button>
                </div>
                <div className="text-xs text-zinc-500">Send only USDT (ERC20). Minimum deposit: $10.</div>
                <Button3D full variant="primary" onClick={simulateDeposit}>
                  Simulate Incoming Transfer
                </Button3D>
              </div>
            )}
            {depositStep === 1 && (
              <div className="py-12 text-center">
                <div className="w-16 h-16 border-4 border-[#00FF94] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-zinc-400 animate-pulse">Detecting on Blockchain...</p>
              </div>
            )}
            {depositStep === 2 && (
              <div className="py-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-[#00FF94] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white">Confirmed</h3>
                <p className="text-zinc-400">+1,000.00 USDT</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
