'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'lucide-react';

const MOCK_LOGS = [
    "System integrity check passed",
    "Gemini Agent: Analyzing BTC/USDT order flow...",
    "New user registration: user_8821 from London",
    "Smart Contract: Payout #9921 executed (0.45 ETH)",
    "Risk Engine: Leverage warning on Account #442",
    "API Gateway: Latency 12ms",
    "Database: Backup completed successfully",
    "DeepSeek: Generating Alpha Signal #772",
    "Viral Engine: Level 3 rebate distributed",
    "Security: IP 192.168.1.44 whitelisted"
];

export function LiveLogStream() {
    const [logs, setLogs] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const newLog = MOCK_LOGS[Math.floor(Math.random() * MOCK_LOGS.length)];
            const timestamp = new Date().toLocaleTimeString();
            setLogs(prev => [`[${timestamp}] ${newLog}`, ...prev].slice(0, 8));
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-black/40 border border-emerald-500/20 rounded-xl p-4 font-mono text-xs h-full overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 text-emerald-500 mb-3 border-b border-emerald-500/20 pb-2">
                <Terminal className="w-3 h-3" />
                <span className="uppercase tracking-widest font-bold">System Log</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-auto" />
            </div>
            <div className="flex-1 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-black/40 to-transparent z-10" />
                <div className="space-y-1.5">
                    <AnimatePresence initial={false}>
                        {logs.map((log, i) => (
                            <motion.div
                                key={`${i}-${log}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1 - (i * 0.15), x: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-emerald-400/90 whitespace-nowrap"
                            >
                                <span className="text-emerald-600 mr-2">➜</span>
                                {log}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black/40 to-transparent z-10" />
            </div>
        </div>
    );
}
