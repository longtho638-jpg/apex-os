import { motion } from 'framer-motion';

export function ZenProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-gray-400">{label}</span>
        <span className="text-white">{value}%</span>
      </div>
      <div className="h-1.5 bg-black/50 border border-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full"
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
            boxShadow: `0 0 10px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}
