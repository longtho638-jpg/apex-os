import React from 'react';
import { motion } from 'framer-motion';

export function HiddenView() {
    return (
        <motion.div
            key="zen-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="py-12 text-center space-y-6"
        >
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 mx-auto border-2 border-cyan-500/30 rounded-full flex items-center justify-center"
            >
                <div className="w-16 h-16 border-2 border-magenta-500/30 rounded-full" />
            </motion.div>

            <div className="space-y-2 text-xs font-mono text-gray-500">
                <p>// PROFIT_DISPLAY: HIDDEN</p>
                <p>// EMOTIONAL_OVERRIDE: ACTIVE</p>
                <p>// FOCUS: STRATEGY_ONLY</p>
            </div>
        </motion.div>
    );
}
