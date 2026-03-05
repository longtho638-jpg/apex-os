'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Clock, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UpgradeModal } from '@/components/checkout/UpgradeModal';
import { upgradeTriggers } from '@/lib/upgrade-triggers';

// Note: In a real app, this would fetch from an API or vaultManager
const MOCK_PENDING_AMOUNT = 0; // Default to 0, useEffect will set it

export function MissedCommissionBanner({ userId }: { userId: string }) {
  const [pendingAmount, setPendingAmount] = useState(MOCK_PENDING_AMOUNT);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // Simulate fetching pending amount
    // In production: fetch(`/api/user/vault?userId=${userId}`)
    // For demo purposes, let's say there's $50 pending if we are in a certain state
    // or just random for visual confirmation
    const randomPending = Math.random() > 0.5 ? 52.5 : 0;
    setPendingAmount(randomPending);

    // Set 24h countdown simulation
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 24);

    const timer = setInterval(() => {
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft('Expired');
        clearInterval(timer);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      }
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  if (pendingAmount <= 0) return null;

  const trigger = upgradeTriggers.missedCommission(pendingAmount);

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl"
        >
          <div className="bg-gradient-to-r from-amber-500/90 to-orange-600/90 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-white/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-lg animate-pulse">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  ${pendingAmount.toFixed(2)} Pending
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {timeLeft}
                  </span>
                </h3>
                <p className="text-sm text-white/90">Grace Period Active! Upgrade to claim this immediately.</p>
              </div>
            </div>

            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-6 py-2 bg-white text-orange-600 font-bold rounded-lg hover:bg-orange-50 transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg"
            >
              Claim Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger={{
          type: trigger.type,
          message: trigger.message,
          urgency: trigger.urgency,
          discount: trigger.discount,
        }}
        userId={userId}
      />
    </>
  );
}
