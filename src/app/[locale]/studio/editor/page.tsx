'use client';

import { useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { IndicatorNode } from '@/components/studio/nodes/IndicatorNode';
import { LogicNode } from '@/components/studio/nodes/LogicNode';
import { ActionNode } from '@/components/studio/nodes/ActionNode';
import { Sidebar } from '@/components/os/sidebar';
import { compileStrategy } from '@/lib/algo/compiler';
import { Play, Save, Plus } from 'lucide-react';

const nodeTypes = {
  indicator: IndicatorNode,
  logic: LogicNode,
  action: ActionNode,
};

const initialNodes = [
  { id: '1', type: 'indicator', position: { x: 100, y: 100 }, data: { label: 'RSI', params: { period: 14, source: 'close' } } },
  { id: '2', type: 'logic', position: { x: 100, y: 300 }, data: { label: 'Less Than', condition: '< 30' } },
  { id: '3', type: 'action', position: { x: 100, y: 500 }, data: { action: 'BUY' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

export default function AlgoStudioPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleCompile = () => {
      const strategy = compileStrategy(nodes, edges);
      console.log('Compiled Strategy:', strategy);
      // In prod: Send to API to save/backtest
      alert('Strategy compiled! Check console.');
  };

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans">
      <Sidebar />
      <main className="flex-1 relative flex flex-col">
        <header className="h-16 border-b border-white/10 bg-black/50 backdrop-blur-xl flex items-center justify-between px-6 z-10">
            <h1 className="font-bold text-lg flex items-center gap-2">
                <span className="text-emerald-400">Algo Studio</span> 
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-zinc-400">Beta</span>
            </h1>
            <div className="flex gap-3">
                <button onClick={handleCompile} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg transition">
                    <Play className="w-4 h-4" /> Run Backtest
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-lg transition">
                    <Save className="w-4 h-4" /> Save
                </button>
            </div>
        </header>

        <div className="flex-1 relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-[#080808]"
            >
                <Background color="#222" gap={20} />
                <Controls className="bg-zinc-800 border-white/10 text-white" />
            </ReactFlow>

            {/* Floating Toolbox */}
            <div className="absolute left-6 top-6 bg-zinc-900/90 backdrop-blur border border-white/10 p-4 rounded-xl shadow-xl w-48 space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase mb-2">Toolbox</h3>
                <div className="space-y-2">
                    <div className="p-2 bg-zinc-800 rounded border border-white/5 cursor-move text-xs hover:border-emerald-500/50 transition">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full" /> Indicator
                        </div>
                    </div>
                    <div className="p-2 bg-zinc-800 rounded border border-white/5 cursor-move text-xs hover:border-blue-500/50 transition">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" /> Logic
                        </div>
                    </div>
                    <div className="p-2 bg-zinc-800 rounded border border-white/5 cursor-move text-xs hover:border-red-500/50 transition">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full" /> Action
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
