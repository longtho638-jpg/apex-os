'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Flame, X, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { UpgradeModal } from '@/components/checkout/UpgradeModal';

export function WinStreakPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    // Check for trigger condition (Mock: Randomly trigger for demo)
    // In prod: Check user trade history from context/API
    const timer = setTimeout(() => {
      const shouldTrigger = Math.random() > 0.7; // 30% chance for demo
      if (shouldTrigger) setIsOpen(true);
    }, 10000); // Check after 10s

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-50 w-[90%] max-w-md"
          >
            <GlassCard className="p-1 flex items-center gap-4 bg-gradient-to-r from-orange-500/20 to-red-600/20 border-orange-500/30">
              <div className="bg-orange-500/20 p-3 rounded-xl ml-2">
                <Flame className="w-6 h-6 text-orange-400 animate-pulse" />
              </div>
              
              <div className="flex-1 py-2">
                <h3 className="font-bold text-white text-sm">You're on fire! 🔥</h3>
                <p className="text-xs text-zinc-300">
                  3 Winning Trades in a row. Lock in these gains with Auto-Trading.
                </p>
              </div>

              <div className="flex items-center gap-2 pr-2">
                <button
                  onClick={() => { setIsOpen(false); setShowUpgrade(true); }}
                  className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  Upgrade <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        trigger={{
          type: 'win_achieved',
          message: "Lock in your winning streak with automated risk management.",
          urgency: 'high',
          discount: 'STREAK20'
        }}
        userId="current-user" // Replace with actual user ID context
      />
    </>
  );
}
