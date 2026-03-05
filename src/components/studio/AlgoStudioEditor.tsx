'use client';

import {
  addEdge,
  Background,
  BackgroundVariant,
  type Connection,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import { useCallback, useRef, useState } from 'react';
import { logger } from '@/lib/logger';
import '@xyflow/react/dist/style.css';

import { Activity, ArrowRightCircle, Box, Maximize, Minus, Play, Plus, Save, Wand2, Zap } from 'lucide-react';
import { Sidebar } from '@/components/os/sidebar';
import { BottomPanel } from '@/components/studio/BottomPanel';
import { ParticleEdge } from '@/components/studio/edges/ParticleEdge';
import { ActionNode } from '@/components/studio/nodes/ActionNode';
import { IndicatorNode } from '@/components/studio/nodes/IndicatorNode';
import { LogicNode } from '@/components/studio/nodes/LogicNode';
import { type BacktestResult, generateMarketData, optimizeStrategy, runBacktest } from '@/lib/algo/backtest-engine';
import { compileStrategy } from '@/lib/algo/compiler';

const nodeTypes = {
  indicator: IndicatorNode,
  logic: LogicNode,
  action: ActionNode,
};

const edgeTypes = {
  particle: ParticleEdge,
};

type AlgoNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label?: string;
    params?: { period: number; source: string };
    condition?: string;
    action?: string;
  };
};

const initialNodes: AlgoNode[] = [
  {
    id: '1',
    type: 'indicator',
    position: { x: 250, y: 100 },
    data: { label: 'RSI', params: { period: 14, source: 'close' } },
  },
  { id: '2', type: 'logic', position: { x: 250, y: 300 }, data: { label: 'Less Than', condition: '< 30' } },
  { id: '3', type: 'action', position: { x: 250, y: 500 }, data: { action: 'BUY' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', type: 'particle', animated: true, style: { stroke: '#34D399' } },
  { id: 'e2-3', source: '2', target: '3', type: 'particle', animated: true, style: { stroke: '#34D399' } },
];

function CustomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <Panel
      position="bottom-right"
      className="bottom-24 right-6 bg-black/80 backdrop-blur-xl border border-white/10 p-1.5 rounded-xl flex flex-col gap-1 shadow-2xl shadow-black/50"
    >
      <button
        onClick={() => zoomIn({ duration: 300 })}
        className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-emerald-400 transition group"
        title="Zoom In"
      >
        <Plus className="w-4 h-4 group-active:scale-90 transition-transform" />
      </button>
      <button
        onClick={() => zoomOut({ duration: 300 })}
        className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-emerald-400 transition group"
        title="Zoom Out"
      >
        <Minus className="w-4 h-4 group-active:scale-90 transition-transform" />
      </button>
      <div className="h-px w-full bg-white/10 my-0.5" />
      <button
        onClick={() => fitView({ duration: 300 })}
        className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-emerald-400 transition group"
        title="Fit View"
      >
        <Maximize className="w-4 h-4 group-active:scale-90 transition-transform" />
      </button>
    </Panel>
  );
}

function AlgoStudioContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition } = useReactFlow();
  const [backtestResults, setBacktestResults] = useState<BacktestResult | null>(null);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => addEdge({ ...params, type: 'particle', animated: true, style: { stroke: '#34D399' } }, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let newNode;
      const id = Math.random().toString();

      if (type === 'indicator') {
        newNode = {
          id,
          type,
          position,
          data: { label: 'New Indicator', params: { period: 14, source: 'close' } },
        };
      } else if (type === 'logic') {
        newNode = {
          id,
          type,
          position,
          data: { label: 'Logic Check', condition: '> 50' },
        };
      } else {
        // Action node
        newNode = {
          id,
          type,
          position,
          data: { action: 'BUY' },
        };
      }

      setNodes((nds: any[]) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );
  const handleOptimize = () => {
    // 1. Generate Data
    const marketData = generateMarketData();

    // 2. Run Optimization
    const result = optimizeStrategy(marketData);

    // 3. Apply Best Parameters
    setNodes((nds) =>
      nds.map((n) => {
        if (n.data.label === 'RSI') {
          const currentParams = n.data.params || { source: 'close', period: 14 };
          return { ...n, data: { ...n.data, params: { ...currentParams, period: result.bestPeriod } } };
        }
        if (n.data.label === 'Less Than') {
          return { ...n, data: { ...n.data, condition: `< ${result.bestThreshold}` } };
        }
        return n;
      }),
    );

    // 4. Show Result
    alert(
      `AI Optimization Complete 🧬\n\nAnalyzed ${result.iterations} iterations.\nBest PnL: +$${result.bestPnL.toFixed(2)}\n\nOptimal Parameters Applied:\n• RSI Period: ${result.bestPeriod}\n• Buy Threshold: ${result.bestThreshold}`,
    );

    // 5. Update Visuals (Simulate run with new params)
    // In a real app, we'd runBacktest(newNodes, edges, marketData) here.
  };

  const handleCompile = () => {
    // 1. Compile Logic (Mock)
    const strategy = compileStrategy(nodes, edges);
    logger.info('Strategy Logic:', strategy);

    // 2. Run Simulation
    const marketData = generateMarketData();
    const results = runBacktest(nodes, edges, marketData);

    setBacktestResults(results);
  };

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden relative">
      <Sidebar />

      <main className="flex-1 relative flex flex-col h-full">
        {/* Header Overlay */}
        <header className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-20 pointer-events-none">
          <div className="pointer-events-auto bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded-xl flex items-center gap-4">
            <h1 className="font-bold text-lg flex items-center gap-2 tracking-tight px-2">
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Algo Studio
              </span>
            </h1>
            <div className="flex gap-2">
              <button
                onClick={handleOptimize}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition shadow-[0_0_15px_rgba(147,51,234,0.4)] animate-pulse"
              >
                <Wand2 className="w-3 h-3" /> Auto-Optimize
              </button>
              <button
                onClick={handleCompile}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold rounded-lg transition shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              >
                <Play className="w-3 h-3 fill-black" /> Run Backtest
              </button>
              <button className="p-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded-lg transition">
                <Save className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            className="bg-[#050505]"
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#333" gap={25} size={1} variant={BackgroundVariant.Dots} />

            {/* Floating Node Library Panel */}
            <Panel
              position="top-left"
              className="top-20 left-4 bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl w-64 pointer-events-auto"
            >
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Box className="w-3 h-3" /> Modules
              </h3>
              <div className="space-y-3">
                <div
                  className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-grab active:cursor-grabbing transition-all border border-transparent hover:border-emerald-500/30"
                  onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'indicator')}
                  draggable
                >
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-200">Indicator</div>
                    <div className="text-[10px] text-zinc-500">Market Data</div>
                  </div>
                </div>

                <div
                  className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-grab active:cursor-grabbing transition-all border border-transparent hover:border-blue-500/30"
                  onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'logic')}
                  draggable
                >
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <ArrowRightCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-200">Logic</div>
                    <div className="text-[10px] text-zinc-500">Conditions</div>
                  </div>
                </div>

                <div
                  className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-grab active:cursor-grabbing transition-all border border-transparent hover:border-red-500/30"
                  onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'action')}
                  draggable
                >
                  <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-200">Action</div>
                    <div className="text-[10px] text-zinc-500">Execution</div>
                  </div>
                </div>
              </div>
            </Panel>

            <CustomControls />
            <MiniMap
              nodeStrokeColor="#333"
              nodeColor="#111"
              maskColor="rgba(0,0,0,0.6)"
              className="bg-black border border-white/10 rounded-lg"
              style={{ bottom: 100, right: 80 }}
            />
          </ReactFlow>
        </div>

        {/* Bottom Panel Overlay */}
        <BottomPanel results={backtestResults} />
      </main>
    </div>
  );
}

export default function AlgoStudioEditor() {
  return (
    <ReactFlowProvider>
      <AlgoStudioContent />
    </ReactFlowProvider>
  );
}
