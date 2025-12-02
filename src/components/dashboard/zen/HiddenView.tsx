import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export function HiddenView() {
    const t = useTranslations('DashboardComponents.Zen.hidden_view');

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
                <p>{t('profit_hidden')}</p>
                <p>{t('emotional_override')}</p>
                <p>{t('focus_strategy')}</p>
            </div>
        </motion.div>
    );
}
