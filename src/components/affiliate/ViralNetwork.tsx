'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button3D } from '@/components/marketing/Button3D';

interface Node {
  id: string;
  level: number;
  x: number;
  y: number;
  value: number;
  parent?: string;
}

export function ViralNetwork() {
  const [nodes, setNodes] = useState<Node[]>([{ id: 'root', level: 0, x: 50, y: 50, value: 1000 }]);
  const [particles, setParticles] = useState<{ id: number; start: Node; end: Node }[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulation Loop
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setNodes((prev) => {
        if (prev.length > 50) return prev;
        const parent = prev[Math.floor(Math.random() * prev.length)];
        if (parent.level >= 4) return prev;

        const angle = Math.random() * Math.PI * 2;
        const distance = 15 / (parent.level + 1);
        const newNode: Node = {
          id: Math.random().toString(36).substring(2, 11),
          level: parent.level + 1,
          x: Math.max(5, Math.min(95, parent.x + Math.cos(angle) * distance)),
          y: Math.max(5, Math.min(95, parent.y + Math.sin(angle) * distance)),
          value: Math.random() * 100,
          parent: parent.id,
        };
        return [...prev, newNode];
      });
    }, 500);

    const particleInterval = setInterval(() => {
      setNodes((prev) => {
        if (prev.length < 2) return prev;
        const sender = prev[Math.floor(Math.random() * (prev.length - 1)) + 1];
        const receiver = prev.find((n) => n.id === sender.parent) || prev[0];
        setParticles((p) => [...p, { id: Date.now() + Math.random(), start: sender, end: receiver }]);
        return prev;
      });
    }, 200);

    return () => {
      clearInterval(interval);
      clearInterval(particleInterval);
    };
  }, [isSimulating]);

  useEffect(() => {
    const t = setInterval(() => setParticles((prev) => prev.filter((p) => Date.now() - p.id < 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full h-[400px] lg:h-[500px] bg-black rounded-3xl border border-white/10 overflow-hidden shadow-2xl mb-8 group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#000_100%)]" />

      {/* Overlay Controls */}
      <div className="absolute top-6 left-6 z-20">
        <div className="flex items-center gap-4">
          <div className="bg-black/50 backdrop-blur border border-white/10 px-4 py-2 rounded-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#00FF94]" /> Apex Viral Cosmos
            </h3>
          </div>
          <Button3D
            onClick={() => setIsSimulating(!isSimulating)}
            variant={isSimulating ? 'danger' : 'primary'}
            className="text-xs px-4 py-2"
          >
            {isSimulating ? 'Stop Growth' : 'Simulate Viral Growth'}
          </Button3D>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 z-20 flex gap-8 pointer-events-none">
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Nodes</div>
          <div className="text-xl font-mono font-bold text-white">{nodes.length}</div>
        </div>
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Flow Rate</div>
          <div className="text-xl font-mono font-bold text-[#00FF94]">{(particles.length * 12.5).toFixed(0)}/m</div>
        </div>
      </div>

      {/* Graph */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full absolute inset-0">
          {nodes.map((node) => {
            if (!node.parent) return null;
            const parent = nodes.find((n) => n.id === node.parent);
            if (!parent) return null;
            return (
              <line
                key={`link-${node.id}`}
                x1={`${node.x}%`}
                y1={`${node.y}%`}
                x2={`${parent.x}%`}
                y2={`${parent.y}%`}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
              />
            );
          })}
        </svg>
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ left: `${p.start.x}%`, top: `${p.start.y}%`, opacity: 1, scale: 1 }}
              animate={{ left: `${p.end.x}%`, top: `${p.end.y}%`, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.8, ease: 'circIn' }}
              className="absolute w-1.5 h-1.5 bg-[#00FF94] rounded-full shadow-[0_0_10px_#00FF94] z-10"
            />
          ))}
        </AnimatePresence>
        {nodes.map((node) => (
          <motion.div
            key={node.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            layout
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center border z-10 transition-colors duration-500 ${node.id === 'root' ? 'w-12 h-12 bg-white border-[#00FF94] shadow-[0_0_30px_rgba(0,255,148,0.3)]' : node.level === 1 ? 'w-6 h-6 bg-zinc-800 border-white/30' : 'w-3 h-3 bg-zinc-900 border-white/10'}`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            {node.id === 'root' && <div className="text-black font-black text-[10px]">YOU</div>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
