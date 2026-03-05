import { motion } from 'framer-motion';
import { memo } from 'react';

interface ApexDNAProps {
  whaleScore: number;
  techScore: number;
  isScanning?: boolean;
}

export const ApexDNA = memo(({ whaleScore, techScore, isScanning = false }: ApexDNAProps) => {
  // Number of DNA base pairs
  const bars = 20;

  return (
    <div className="relative h-8 w-full flex items-center justify-between gap-0.5 overflow-hidden mask-linear-fade">
      {Array.from({ length: bars }).map((_, i) => {
        // Calculate phase for sine wave
        const _phase = (i / bars) * Math.PI * 2;

        // Dynamic height based on scores and position
        // Whale (Purple) influences the "top" strand
        // Tech (Cyan) influences the "bottom" strand

        const whaleIntensity = Math.max(0.2, whaleScore / 100);
        const techIntensity = Math.max(0.2, techScore / 100);

        return (
          <div key={i} className="relative w-1 h-full flex flex-col justify-center items-center">
            {/* Whale Strand (Top) */}
            <motion.div
              className="w-0.5 bg-purple-500 rounded-full shadow-[0_0_5px_#a855f7]"
              animate={{
                height: [4, 12 * whaleIntensity, 4],
                opacity: [0.5, 1, 0.5],
                y: [-2, 2, -2],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.05,
                ease: 'easeInOut',
              }}
            />

            {/* Connector (Hidden or faint) */}
            <div className="h-0.5 w-full bg-white/5 my-0.5" />

            {/* Tech Strand (Bottom) */}
            <motion.div
              className="w-0.5 bg-cyan-500 rounded-full shadow-[0_0_5px_#06b6d4]"
              animate={{
                height: [4, 12 * techIntensity, 4],
                opacity: [0.5, 1, 0.5],
                y: [2, -2, 2],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.05, // Synced delay creates the wave
                ease: 'easeInOut',
              }}
            />
          </div>
        );
      })}

      {/* Scanning Overlay */}
      {isScanning && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/2 h-full animate-scan-fast pointer-events-none" />
      )}
    </div>
  );
});
