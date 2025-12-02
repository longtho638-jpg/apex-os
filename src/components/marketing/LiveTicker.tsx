'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const LiveTicker = ({ trades }: { trades: any[] }) => {
    if (!trades || trades.length === 0) return null;

    // Duplicate trades to create seamless loop
    const displayTrades = [...trades, ...trades, ...trades];

    return (
        <div className="w-full bg-black/50 border-y border-white/5 overflow-hidden py-3 backdrop-blur-sm">
            <motion.div
                className="flex gap-8 whitespace-nowrap"
                animate={{ x: [0, -1000] }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 20 // Adjust speed based on content width
                }}
            >
                {displayTrades.map((trade, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-mono">
                        <span className="font-bold text-white">{trade.symbol}</span>
                        <span className={trade.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'}>
                            {trade.side}
                        </span>
                        <span className="text-zinc-400">{Number(trade.quantity).toFixed(4)} @ ${Number(trade.price).toLocaleString()}</span>
                        {trade.side === 'BUY' ? (
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                        ) : (
                            <TrendingDown className="w-3 h-3 text-red-400" />
                        )}
                    </div>
                ))}
            </motion.div>
        </div>
    );
};
