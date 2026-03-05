'use client';

import { Activity, Pause, Play, Save, Settings } from 'lucide-react';
import { useState } from 'react';

interface StrategyConfig {
  id: string;
  name: string;
  type: 'MOMENTUM' | 'MEAN_REVERSION' | 'ML_PREDICTIVE';
  status: 'ACTIVE' | 'PAUSED';
  parameters: Record<string, number>;
}

export default function StrategyManager() {
  const [strategies, setStrategies] = useState<StrategyConfig[]>([
    {
      id: 'strat_01',
      name: 'BTC Momentum Alpha',
      type: 'MOMENTUM',
      status: 'ACTIVE',
      parameters: {
        rsi_period: 14,
        macd_fast: 12,
        macd_slow: 26,
        macd_signal: 9,
      },
    },
  ]);

  const handleParamChange = (id: string, param: string, value: number) => {
    setStrategies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, parameters: { ...s.parameters, [param]: value } } : s)),
    );
  };

  const toggleStatus = (id: string) => {
    setStrategies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : s)),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-400" />
          Active Strategies
        </h2>
        <button className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors">
          + New Strategy
        </button>
      </div>

      <div className="grid gap-4">
        {strategies.map((strategy) => (
          <div key={strategy.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${strategy.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}
                />
                <div>
                  <h3 className="font-bold text-white">{strategy.name}</h3>
                  <p className="text-xs text-gray-400">{strategy.type} Strategy</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleStatus(strategy.id)}
                  className={`p-2 rounded-lg transition-colors ${strategy.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'}`}
                >
                  {strategy.status === 'ACTIVE' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10">
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(strategy.parameters).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs text-gray-500 uppercase">{key.replace('_', ' ')}</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleParamChange(strategy.id, key, Number(e.target.value))}
                    className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm text-white focus:border-blue-500/50 outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded text-xs font-medium hover:bg-green-500/20 transition-colors">
                <Save className="h-3 w-3" />
                Save Configuration
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
