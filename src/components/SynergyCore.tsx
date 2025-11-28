"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * THE APEX SYNERGY CORE
 * 
 * Visualizes collective power through:
 * - Network effect (nodes connecting)
 * - Volume reactor (progress ring)
 * - Live notifications (whale joins, partnerships)
 * 
 * Psychology: FOMO + Belonging to elite group
 */

interface Toast {
    id: number;
    message: string;
    type: 'whale' | 'partner' | 'milestone';
}

interface SynergyData {
    totalVolume: number;
    nextTierVolume: number;
    tierName: string;
    progress: number;
    activeUsers: number;
    techModules: string[];
}

export default function SynergyCore() {
    const [synergyData, setSynergyData] = useState<SynergyData>({
        totalVolume: 15420000,
        nextTierVolume: 20000000,
        tierName: 'VIP 8',
        progress: 77.1,
        activeUsers: 847,
        techModules: ['Tax Module', 'AI Guardian', 'Auto-Audit']
    });

    const [toasts, setToasts] = useState<Toast[]>([]);
    const [nodes, setNodes] = useState<Array<{ x: number, y: number, id: number }>>([]);

    // Calculate synergy power (increases over time)
    useEffect(() => {
        const interval = setInterval(() => {
            setSynergyData(prev => ({
                ...prev,
                totalVolume: prev.totalVolume + Math.random() * 50000,
                progress: ((prev.totalVolume + Math.random() * 50000) / prev.nextTierVolume) * 100,
                activeUsers: prev.activeUsers + (Math.random() > 0.5 ? 1 : 0)
            }));
        }, 2000); // Update every 2 seconds

        return () => clearInterval(interval);
    }, []);

    // Generate toast notifications
    useEffect(() => {
        const toastMessages = [
            { message: 'New Whale joined via Referral (+$500k Vol)', type: 'whale' as const },
            { message: 'Partner [TradingView] integrated', type: 'partner' as const },
            { message: 'Partner [Koinly] connected', type: 'partner' as const },
            { message: 'Elite Trader unlocked AI Guardian', type: 'whale' as const },
            { message: '$18M Volume Milestone Reached! 🎉', type: 'milestone' as const },
            { message: 'KOL Network expanded (+250 users)', type: 'whale' as const }
        ];

        const interval = setInterval(() => {
            const randomToast = toastMessages[Math.floor(Math.random() * toastMessages.length)];
            const newToast = {
                id: Date.now(),
                ...randomToast
            };

            setToasts(prev => [...prev, newToast]);

            // Remove toast after 4 seconds
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== newToast.id));
            }, 4000);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Generate network nodes
    useEffect(() => {
        const newNodes = Array.from({ length: 30 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100
        }));
        setNodes(newNodes);
    }, []);

    return (
        <div className="relative w-full h-[600px] bg-black/50 rounded-3xl border border-[#00FF00]/20 overflow-hidden backdrop-blur-md">
            {/* Layer 1: Network Background */}
            <NetworkBackground nodes={nodes} />

            {/* Layer 2: Volume Reactor (Center) */}
            <div className="absolute inset-0 flex items-center justify-center">
                <VolumeReactor data={synergyData} />
            </div>

            {/* Layer 3: Toast Notifications */}
            <div className="absolute bottom-6 right-6 space-y-2 z-20">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <ToastNotification key={toast.id} toast={toast} />
                    ))}
                </AnimatePresence>
            </div>

            {/* Tech Stack Hexagons (Left) */}
            <div className="absolute left-6 top-6 space-y-3 z-10">
                {synergyData.techModules.map((module, i) => (
                    <TechModule key={module} name={module} delay={i * 0.1} />
                ))}
            </div>

            {/* Stats (Top Right) */}
            <div className="absolute top-6 right-6 text-right z-10">
                <div className="text-sm text-gray-400">Active Traders</div>
                <div className="text-3xl font-bold text-[#00FF00]">
                    {synergyData.activeUsers.toLocaleString()}
                </div>
            </div>
        </div>
    );
}

// ========== Sub-Components ==========

function NetworkBackground({ nodes }: { nodes: Array<{ x: number, y: number, id: number }> }) {
    return (
        <svg className="absolute inset-0 w-full h-full opacity-30">
            <defs>
                <radialGradient id="nodeGlow">
                    <stop offset="0%" stopColor="#00FF00" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#00FF00" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Connecting Lines */}
            {nodes.map((node, i) =>
                nodes.slice(i + 1, i + 4).map((targetNode, j) => (
                    <motion.line
                        key={`${i}-${j}`}
                        x1={`${node.x}%`}
                        y1={`${node.y}%`}
                        x2={`${targetNode.x}%`}
                        y2={`${targetNode.y}%`}
                        stroke="#00FF00"
                        strokeWidth="0.5"
                        opacity="0.3"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.3 }}
                        transition={{ duration: 2, delay: i * 0.05 }}
                    />
                ))
            )}

            {/* Nodes */}
            {nodes.map((node) => (
                <motion.circle
                    key={node.id}
                    cx={`${node.x}%`}
                    cy={`${node.y}%`}
                    r="3"
                    fill="url(#nodeGlow)"
                    initial={{ scale: 0 }}
                    animate={{
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: node.id * 0.1
                    }}
                />
            ))}
        </svg>
    );
}

function VolumeReactor({ data }: { data: SynergyData }) {
    const circumference = 2 * Math.PI * 120;
    const strokeDashoffset = circumference - (data.progress / 100) * circumference;

    return (
        <div className="relative">
            {/* Outer glow ring */}
            <motion.div
                className="absolute inset-0 rounded-full blur-3xl"
                style={{
                    background: `radial-gradient(circle, rgba(0,255,0,0.3) 0%, transparent 70%)`
                }}
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Progress Ring SVG */}
            <svg width="300" height="300" className="relative z-10">
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00FF00" />
                        <stop offset="100%" stopColor="#00AA00" />
                    </linearGradient>
                </defs>

                {/* Background circle */}
                <circle
                    cx="150"
                    cy="150"
                    r="120"
                    fill="none"
                    stroke="rgba(0,255,0,0.1)"
                    strokeWidth="8"
                />

                {/* Progress circle */}
                <motion.circle
                    cx="150"
                    cy="150"
                    r="120"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 150 150)"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-center">
                    <div className="text-sm text-gray-400 mb-2">COLLECTIVE VOLUME</div>
                    <motion.div
                        className="text-4xl font-bold text-[#00FF00] mb-1"
                        key={Math.floor(data.totalVolume)}
                    >
                        ${(data.totalVolume / 1000000).toFixed(2)}M
                    </motion.div>
                    <div className="text-xs text-gray-500">
                        Next Tier: {data.tierName}
                    </div>
                    <div className="text-xs text-[#00FF00] mt-1">
                        {data.progress.toFixed(1)}% completed
                    </div>
                </div>
            </div>
        </div>
    );
}

function ToastNotification({ toast }: { toast: Toast }) {
    const bgColor =
        toast.type === 'whale' ? 'bg-blue-500/20 border-blue-500/50' :
            toast.type === 'partner' ? 'bg-purple-500/20 border-purple-500/50' :
                'bg-[#00FF00]/20 border-[#00FF00]/50';

    const icon =
        toast.type === 'whale' ? '🐋' :
            toast.type === 'partner' ? '🤝' :
                '🎉';

    return (
        <motion.div
            className={`${bgColor} border backdrop-blur-md rounded-lg px-4 py-3 min-w-[300px] max-w-[400px]`}
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
        >
            <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <span className="text-sm text-white">{toast.message}</span>
            </div>
        </motion.div>
    );
}

function TechModule({ name, delay }: { name: string, delay: number }) {
    return (
        <motion.div
            className="relative group cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
        >
            {/* Hexagon shape */}
            <div className="w-32 h-10 bg-[#00FF00]/10 border border-[#00FF00]/30 backdrop-blur-sm flex items-center justify-center relative overflow-hidden group-hover:bg-[#00FF00]/20 transition-all">
                {/* Scan line effect on hover */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00FF00]/30 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.8 }}
                />

                <span className="text-xs font-mono text-[#00FF00] relative z-10">{name}</span>

                {/* Active indicator */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <motion.div
                        className="w-2 h-2 rounded-full bg-[#00FF00]"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>
            </div>

            {/* Tooltip on hover */}
            <div className="absolute left-full ml-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                <div className="bg-black/90 border border-[#00FF00]/50 px-3 py-2 rounded text-xs text-gray-300">
                    Status: <span className="text-[#00FF00]">ACTIVE</span>
                </div>
            </div>
        </motion.div>
    );
}
