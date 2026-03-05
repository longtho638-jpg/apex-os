'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bell, DollarSign, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Activity {
  id: string;
  type: 'subscription' | 'signal' | 'profit';
  message: string;
  timestamp: number;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const generateMockActivity = () => {
      const types = ['subscription', 'signal', 'profit'] as const;
      const type = types[Math.floor(Math.random() * types.length)];
      const locations = ['Singapore', 'New York', 'London', 'Tokyo', 'Berlin'];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const symbols = ['BTC', 'ETH', 'SOL'];
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];

      let message = '';
      if (type === 'subscription') message = `New PRO Member from ${location}`;
      if (type === 'signal') message = `AI Signal Generated: ${symbol} BUY`;
      if (type === 'profit') message = `User profit: +$${(Math.random() * 500).toFixed(2)} on ${symbol}`;

      return {
        id: Math.random().toString(36),
        type,
        message,
        timestamp: Date.now(),
      };
    };

    // Initial fill
    setActivities([generateMockActivity()]);

    const interval = setInterval(() => {
      setActivities((prev) => [generateMockActivity(), ...prev].slice(0, 3));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col-reverse gap-3 pointer-events-none">
      <AnimatePresence>
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl flex items-center gap-3 w-80 pointer-events-auto"
          >
            <div
              className={`p-2 rounded-full ${
                activity.type === 'subscription'
                  ? 'bg-purple-500/20 text-purple-400'
                  : activity.type === 'signal'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              {activity.type === 'subscription' && <Zap size={16} />}
              {activity.type === 'signal' && <Bell size={16} />}
              {activity.type === 'profit' && <DollarSign size={16} />}
            </div>
            <div>
              <p className="text-xs font-medium text-white">{activity.message}</p>
              <p className="text-[10px] text-zinc-500">Just now</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
