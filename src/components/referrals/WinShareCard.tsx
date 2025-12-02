'use client';

import { useRef, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Share2, Download } from 'lucide-react';

interface WinCardProps {
  pair: string;
  roi: number;
  referralCode: string;
}

export function WinShareCard({ pair, roi, referralCode }: WinCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw Card Background
    const gradient = ctx.createLinearGradient(0, 0, 600, 315);
    gradient.addColorStop(0, '#064e3b'); // Emerald-900
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 315);

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(`${pair} Trade`, 40, 60);

    ctx.fillStyle = '#34d399'; // Emerald-400
    ctx.font = 'bold 80px Arial';
    ctx.fillText(`+${roi.toFixed(2)}%`, 40, 150);

    ctx.fillStyle = '#a1a1aa'; // Zinc-400
    ctx.font = '20px Arial';
    ctx.fillText('Powered by ApexOS AI', 40, 200);

    // Referral Footer
    ctx.fillStyle = '#18181b'; // Zinc-900
    ctx.fillRect(0, 250, 600, 65);

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.fillText(`Start trading with AI: apexrebate.com/r/${referralCode}`, 40, 290);

  }, [pair, roi, referralCode]);

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `apex-win-${pair}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        width={600}
        height={315}
        className="w-full h-auto rounded-xl shadow-2xl border border-white/10"
      />

      <div className="flex gap-3">
        <button
          onClick={downloadImage}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
        >
          <Download className="w-4 h-4" /> Download
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white rounded-lg transition"
        >
          <Share2 className="w-4 h-4" /> Tweet
        </button>
      </div>
    </div>
  );
}
