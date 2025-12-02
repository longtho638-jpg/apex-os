import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WowEmptyStateProps {
    title: string;
    description: string;
    icon: LucideIcon;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function WowEmptyState({ title, description, icon: Icon, action, className }: WowEmptyStateProps) {
    return (
        <div className={cn("relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-12 text-center", className)}>
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00FF94]/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
                {/* Animated Icon Container */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-[#00FF94]/20 blur-xl rounded-full" />
                    <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-[#00FF94]/20 to-transparent border border-[#00FF94]/30 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(0,255,148,0.3)]">
                        <Icon className="h-10 w-10 text-[#00FF94]" />
                    </div>

                    {/* Floating Particles */}
                    <motion.div
                        animate={{ y: [-5, 5, -5] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-2 -right-2"
                    >
                        <Sparkles className="h-6 w-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                    </motion.div>
                </motion.div>

                {/* Text Content */}
                <div className="max-w-md space-y-2">
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                        {title}
                    </h3>
                    <p className="text-zinc-400 leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Action Button */}
                {action && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={action.onClick}
                        className="group relative px-8 py-3 bg-[#00FF94] text-black font-bold rounded-xl overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(0,255,148,0.4)]"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative flex items-center gap-2">
                            {action.label}
                        </span>
                    </motion.button>
                )}
            </div>
        </div>
    );
}
