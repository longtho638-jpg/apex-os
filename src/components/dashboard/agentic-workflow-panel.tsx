'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Brain, Shield, Zap, TrendingUp, Activity, CheckCircle } from 'lucide-react';
import { UNIFIED_TIERS, TIER_ORDER, getTierByVolume, type TierId } from '@apex-os/vibe-payment';

interface AgenticWorkflowPanelProps {
  currentTierId: TierId;
  monthlyVolume: number;
  deployedAgents?: Array<{
    id: string;
    name: string;
    type: string;
    status: 'active' | 'idle' | 'error';
    lastAction?: string;
  }>;
}

const STATUS_STYLES = {
  active: { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', dot: 'bg-emerald-400', label: 'Active' },
  idle:   { color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/30',   dot: 'bg-amber-400',   label: 'Idle'   },
  error:  { color: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/30',        dot: 'bg-red-400',     label: 'Error'  },
} as const;

const PIPELINE_STEPS = [
  { icon: Brain,  label: 'Signal Detection',  desc: 'AI pattern scan'    },
  { icon: Shield, label: 'Risk Assessment',   desc: 'Portfolio guard'    },
  { icon: Zap,    label: 'Execution',         desc: 'Order dispatch'     },
] as const;

function formatVolume(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v}`;
}

export default function AgenticWorkflowPanel({
  currentTierId,
  monthlyVolume,
  deployedAgents = [],
}: AgenticWorkflowPanelProps) {
  const tier = UNIFIED_TIERS[currentTierId];
  const currentIdx = TIER_ORDER.indexOf(currentTierId);
  const nextTierId = TIER_ORDER[currentIdx + 1] as TierId | undefined;
  const nextTier = nextTierId ? UNIFIED_TIERS[nextTierId] : null;

  const progressPct = nextTier
    ? Math.min(100, ((monthlyVolume - tier.volumeThreshold) / (nextTier.volumeThreshold - tier.volumeThreshold)) * 100)
    : 100;

  const volumeBasedTier = getTierByVolume(monthlyVolume);
  const canAutoUpgrade = volumeBasedTier !== currentTierId && TIER_ORDER.indexOf(volumeBasedTier) > currentIdx;

  return (
    <div className="space-y-4">
      {/* Tier Progression Bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/40 border border-white/10 rounded-xl p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-400" />
            <span className="text-sm font-semibold text-white">{tier.name} Tier</span>
            {canAutoUpgrade && (
              <span className="text-xs bg-emerald-400/20 text-emerald-400 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                Auto-Upgrade Ready
              </span>
            )}
          </div>
          <span className="text-xs text-zinc-400">{formatVolume(monthlyVolume)} / {nextTier ? formatVolume(nextTier.volumeThreshold) : '∞'}</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
          />
        </div>
        {nextTier && (
          <p className="text-xs text-zinc-500 mt-1.5">
            {formatVolume(nextTier.volumeThreshold - monthlyVolume)} to unlock <span className="text-zinc-300">{nextTier.name}</span> — {nextTier.agentSlots} agents, {(100 - nextTier.spreadBps / 10).toFixed(1)}% tighter spread
          </p>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Agent Status Grid */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/40 border border-white/10 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Bot size={16} className="text-zinc-400" />
            <span className="text-sm font-semibold text-white">Deployed Agents</span>
            <span className="ml-auto text-xs text-zinc-500">{deployedAgents.length}/{tier.agentSlots === Infinity ? '∞' : tier.agentSlots} slots</span>
          </div>

          {deployedAgents.length === 0 ? (
            <div className="text-center py-6 text-zinc-600 text-sm">No agents deployed</div>
          ) : (
            <div className="space-y-2">
              {deployedAgents.map((agent, i) => {
                const s = STATUS_STYLES[agent.status];
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border ${s.bg}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${s.dot} shrink-0`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white truncate">{agent.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{agent.type}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-xs font-semibold ${s.color}`}>{s.label}</p>
                      {agent.lastAction && (
                        <p className="text-xs text-zinc-600 max-w-[80px] truncate">{agent.lastAction}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Workflow Pipeline */}
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-black/40 border border-white/10 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-zinc-400" />
            <span className="text-sm font-semibold text-white">Workflow Pipeline</span>
          </div>

          <div className="flex items-center justify-between">
            {PIPELINE_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
                      className="w-10 h-10 rounded-full bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center"
                    >
                      <Icon size={18} className="text-emerald-400" />
                    </motion.div>
                    <p className="text-xs font-medium text-zinc-300 text-center leading-tight">{step.label}</p>
                    <p className="text-xs text-zinc-600 text-center">{step.desc}</p>
                  </div>

                  {i < PIPELINE_STEPS.length - 1 && (
                    <div className="flex-shrink-0 px-1 mb-6">
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, delay: i * 0.4, repeat: Infinity }}
                        className="w-6 h-px bg-gradient-to-r from-emerald-400/60 to-emerald-400/20"
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
            <CheckCircle size={14} className="text-emerald-400" />
            <span className="text-xs text-zinc-400">Pipeline operational — {tier.aiRequestsPerDay === Infinity ? 'unlimited' : tier.aiRequestsPerDay} AI req/day</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
