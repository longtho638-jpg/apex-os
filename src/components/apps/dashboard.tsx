'use client';

import { Activity, ArrowDown, ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchPositions, fetchSystemStatus, fetchWatchlist } from '@/lib/api';
import { cn } from '@/lib/utils';

function TickerCell({ value, className }: { value: number; className?: string }) {
  const [prevValue, setPrevValue] = useState(value);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (value > prevValue) setFlash('up');
    else if (value < prevValue) setFlash('down');

    setPrevValue(value);

    const timer = setTimeout(() => setFlash(null), 1000);
    return () => clearTimeout(timer);
  }, [value, prevValue]);

  return (
    <span
      className={cn(
        className,
        'transition-colors duration-300',
        flash === 'up' && 'text-green-500 font-bold',
        flash === 'down' && 'text-red-500 font-bold',
      )}
    >
      {value.toFixed(2)}
    </span>
  );
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('trade');
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [status, setStatus] = useState({ market: 'CONNECTING...', connection: 'CHECKING', agents_active: 0 });

  useEffect(() => {
    async function loadData() {
      const w = await fetchWatchlist();
      const p = await fetchPositions();
      const s = await fetchSystemStatus();

      if (w.length > 0) setWatchlist(w);
      if (p.length > 0) setPositions(p);
      setStatus(s);
    }
    loadData();

    // Poll every 2 seconds for faster updates
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full w-full flex-col bg-[#050505] text-white font-mono">
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b border-[#262626] px-4 bg-[#0a0a0a]">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          <span className="font-bold tracking-wider">APEX TRADER</span>
        </div>
        <div className="flex gap-4 text-xs text-gray-400">
          <span>MARKET: {status.market}</span>
          <span className={cn(status.connection === 'STABLE' ? 'text-green-500' : 'text-yellow-500')}>
            CONN: {status.connection}
          </span>
          <span className="text-blue-400">AGENTS: {status.agents_active}</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Watchlist */}
        <div className="w-64 border-r border-[#262626] bg-[#0a0a0a] flex flex-col">
          <div className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-[#262626]">
            Watchlist
          </div>
          <div className="flex-1 overflow-y-auto">
            {watchlist.map((item) => (
              <div
                key={item.symbol}
                className="flex items-center justify-between p-3 hover:bg-[#1a1a1a] cursor-pointer border-b border-[#1a1a1a] transition-colors"
              >
                <div>
                  <div className="font-bold text-sm">{item.symbol}</div>
                  <div className="text-xs text-gray-500">US Equity</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    <TickerCell value={item.price} />
                  </div>
                  <div
                    className={cn(
                      'text-xs flex items-center justify-end gap-1',
                      item.change >= 0 ? 'text-green-500' : 'text-red-500',
                    )}
                  >
                    {item.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {Math.abs(item.change_percent).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Chart & Trade */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chart Area (Mock SVG) */}
          <div className="flex-1 p-4 relative border-b border-[#262626]">
            <div className="absolute top-4 left-4 z-10">
              <h2 className="text-2xl font-bold">AAPL</h2>
              <div className="text-sm text-gray-400">Apple Inc.</div>
            </div>
            <div className="h-full w-full flex items-end justify-between gap-1 opacity-80">
              {/* Simple CSS Bar Chart for visual effect */}
              {Array.from({ length: 40 }).map((_, i) => {
                const height = 30 + Math.random() * 50;
                const isGreen = Math.random() > 0.4;
                return (
                  <div
                    key={i}
                    className={cn(
                      'w-full rounded-sm opacity-80 hover:opacity-100 transition-opacity',
                      isGreen ? 'bg-green-500/20 border-t border-green-500' : 'bg-red-500/20 border-t border-red-500',
                    )}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Positions Panel */}
          <div className="h-1/3 bg-[#0a0a0a] flex flex-col">
            <div className="flex items-center gap-4 border-b border-[#262626] px-4">
              {['POSITIONS', 'ORDERS', 'HISTORY'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={cn(
                    'h-10 text-xs font-bold border-b-2 px-2 transition-colors',
                    activeTab === tab.toLowerCase()
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-gray-500 hover:text-gray-300',
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-gray-500 bg-[#111]">
                  <tr>
                    <th className="p-3 font-medium">Symbol</th>
                    <th className="p-3 font-medium text-right">Qty</th>
                    <th className="p-3 font-medium text-right">Avg Price</th>
                    <th className="p-3 font-medium text-right">Current</th>
                    <th className="p-3 font-medium text-right">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => (
                    <tr key={pos.symbol} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a]">
                      <td className="p-3 font-bold text-blue-400">{pos.symbol}</td>
                      <td className="p-3 text-right">{pos.qty}</td>
                      <td className="p-3 text-right">{pos.avg.toFixed(2)}</td>
                      <td className="p-3 text-right">{pos.current.toFixed(2)}</td>
                      <td
                        className={cn('p-3 text-right font-medium', pos.pnl >= 0 ? 'text-green-500' : 'text-red-500')}
                      >
                        {pos.pnl >= 0 ? '+' : ''}
                        {pos.pnl.toFixed(2)} ({pos.pnl_percent}%)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Order Entry */}
        <div className="w-72 border-l border-[#262626] bg-[#0a0a0a] p-4 flex flex-col gap-4">
          <div className="text-sm font-bold text-gray-400 uppercase">Order Entry</div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Symbol</label>
              <input
                type="text"
                value="AAPL"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm focus:border-blue-500 outline-none"
                readOnly
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Quantity</label>
                <input
                  type="number"
                  defaultValue="10"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Price</label>
                <input
                  type="number"
                  defaultValue="173.50"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-4">
              <button className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded transition-colors">
                BUY
              </button>
              <button className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded transition-colors">
                SELL
              </button>
            </div>
          </div>

          <div className="mt-auto border-t border-[#262626] pt-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-500">Buying Power</span>
              <span className="font-bold">$45,230.00</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Margin Used</span>
              <span className="font-bold text-yellow-500">$12,400.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
