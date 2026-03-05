import { motion } from 'framer-motion';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { memo, useMemo } from 'react';

interface NeuralMatrixProps {
  macroTrend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  microRsi: number;
  macroRsi: number;
  netVolumeDelta: number;
  confidence: number;
  isActive: boolean;
}

export const NeuralMatrix = memo(
  ({ macroTrend, microRsi, macroRsi, netVolumeDelta, confidence, isActive }: NeuralMatrixProps) => {
    // Generate dot grid animation
    const gridSize = 8;
    const dots = useMemo(() => {
      return Array.from({ length: gridSize * gridSize }, (_, i) => ({
        id: i,
        x: (i % gridSize) * 12,
        y: Math.floor(i / gridSize) * 12,
      }));
    }, []);

    // Calculate metrics
    const rsiBalance = (microRsi + macroRsi) / 2;
    const volumeIntensity = Math.min(Math.abs(netVolumeDelta) / 1000000, 1);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isActive ? 1 : 0.7, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-black/90 backdrop-blur-xl p-4 shadow-2xl"
      >
        {/* Holographic Frame */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10" />
          <motion.div
            className="absolute inset-0 border border-purple-500/50"
            animate={{
              boxShadow: isActive
                ? ['0 0 10px rgba(168,85,247,0.3)', '0 0 20px rgba(168,85,247,0.5)', '0 0 10px rgba(168,85,247,0.3)']
                : '0 0 5px rgba(168,85,247,0.2)',
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* Neural Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <svg width="96" height="96" className="absolute top-2 left-2">
            {dots.map((dot) => (
              <motion.circle
                key={dot.id}
                cx={dot.x}
                cy={dot.y}
                r={1}
                fill="#a855f7"
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: dot.id * 0.05,
                }}
              />
            ))}
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
              Neural Matrix
              <motion.div
                className="w-2 h-2 rounded-full bg-purple-500"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </h3>
            <div className="text-[9px] font-mono text-cyan-400">LIVE</div>
          </div>

          {/* Metric Grid */}
          <div className="space-y-3">
            {/* Macro Trend */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-zinc-400 uppercase tracking-wide">Macro Trend</span>
              <div className="flex items-center gap-1.5">
                {macroTrend === 'BULLISH' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                {macroTrend === 'BEARISH' && <TrendingDown className="w-3 h-3 text-red-400" />}
                {macroTrend === 'NEUTRAL' && <Minus className="w-3 h-3 text-zinc-400" />}
                <span
                  className={`text-[10px] font-bold ${
                    macroTrend === 'BULLISH'
                      ? 'text-emerald-400'
                      : macroTrend === 'BEARISH'
                        ? 'text-red-400'
                        : 'text-zinc-400'
                  }`}
                >
                  {macroTrend}
                </span>
              </div>
            </div>

            {/* RSI Balance */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-zinc-400 uppercase tracking-wide">RSI Balance</span>
                <span className="text-[10px] font-mono text-white">{rsiBalance.toFixed(1)}</span>
              </div>
              <div className="flex gap-1 h-1">
                <motion.div
                  className="bg-purple-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${microRsi}%` }}
                  transition={{ duration: 0.5 }}
                />
                <motion.div
                  className="bg-cyan-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${macroRsi}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                />
              </div>
              <div className="flex justify-between text-[8px] text-zinc-500 mt-0.5">
                <span>Micro: {microRsi.toFixed(0)}</span>
                <span>Macro: {macroRsi.toFixed(0)}</span>
              </div>
            </div>

            {/* Volume Flow */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-zinc-400 uppercase tracking-wide">Volume Flow</span>
                <span
                  className={`text-[10px] font-mono font-bold ${netVolumeDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                >
                  {netVolumeDelta >= 0 ? '+' : ''}
                  {(netVolumeDelta / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${netVolumeDelta >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${volumeIntensity * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Signal Confidence */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-zinc-400 uppercase tracking-wide">Confidence</span>
                <span className="text-[10px] font-mono text-white">{confidence.toFixed(0)}%</span>
              </div>
              <div className="relative h-1 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence}%` }}
                  transition={{ duration: 0.5 }}
                />
                {/* Pulse effect when high confidence */}
                {confidence > 70 && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500"
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  },
);
