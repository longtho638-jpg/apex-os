'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export function AIBrainVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const nodes: { x: number; y: number; size: number; vx: number; vy: number; active: number }[] = [];
    
    // Initialize nodes
    for (let i = 0; i < 40; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        active: 0
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw nodes
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        
        // Bounce off walls
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        
        // Pulse activation randomly
        if (Math.random() < 0.01) node.active = 1;
        if (node.active > 0) node.active -= 0.02;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 148, ${0.3 + node.active})`;
        ctx.fill();
      });

      // Draw connections
      ctx.strokeStyle = 'rgba(0, 255, 148, 0.1)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            // Highlight active paths
            if (nodes[i].active > 0.5 || nodes[j].active > 0.5) {
                ctx.strokeStyle = `rgba(0, 255, 148, ${0.4 * Math.max(nodes[i].active, nodes[j].active)})`;
            } else {
                ctx.strokeStyle = `rgba(0, 255, 148, ${0.1 - dist / 1000})`;
            }
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="relative w-full h-[400px] lg:h-[600px] bg-[#050505] rounded-2xl border border-emerald-500/20 overflow-hidden shadow-[0_0_50px_-12px_rgba(0,255,148,0.1)]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505] z-10" />
        <div className="absolute top-6 left-6 z-20">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest">Neural Core Active</span>
            </div>
        </div>
        
        <canvas 
            ref={canvasRef} 
            width={800} 
            height={600} 
            className="w-full h-full opacity-60"
        />
        
        {/* Data Flow Labels */}
        <div className="absolute inset-0 z-20 pointer-events-none">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                className="absolute top-1/4 left-10 text-[10px] text-emerald-400/70 font-mono bg-emerald-900/20 px-2 py-1 rounded border border-emerald-500/20"
            >
                Ingesting Price Action
            </motion.div>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                className="absolute top-1/2 right-10 text-[10px] text-emerald-400/70 font-mono bg-emerald-900/20 px-2 py-1 rounded border border-emerald-500/20"
            >
                Analyzing Sentiment
            </motion.div>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.7 }}
                className="absolute bottom-1/4 left-1/3 text-[10px] text-emerald-400/70 font-mono bg-emerald-900/20 px-2 py-1 rounded border border-emerald-500/20"
            >
                Detecting Whales
            </motion.div>
        </div>
    </div>
  );
}
