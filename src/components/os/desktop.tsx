import { Activity, ArrowUpRight, DollarSign, Zap } from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen w-full bg-[#050505] p-8 pb-24 text-white">
            <div className="mb-12 space-y-2">
                <h1 className="text-5xl font-bold tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                    Welcome back, Trader.
                </h1>
                <p className="text-xl text-gray-400">Apex Financial OS is active and monitoring.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-4 mb-12">
                <div className="rounded-2xl border border-[#262626] bg-[#0a0a0a] p-6 transition-all hover:border-green-500/50">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-400">Total PnL</span>
                        <DollarSign className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-bold text-green-500">+$12,450.00</div>
                    <div className="text-sm text-green-400 mt-1">+2.4% today</div>
                </div>

                <div className="rounded-2xl border border-[#262626] bg-[#0a0a0a] p-6 transition-all hover:border-blue-500/50">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-400">Active Positions</span>
                        <Activity className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-3xl font-bold text-white">8</div>
                    <div className="text-sm text-blue-400 mt-1">3 Long, 5 Short</div>
                </div>

                <div className="rounded-2xl border border-[#262626] bg-[#0a0a0a] p-6 transition-all hover:border-purple-500/50">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-400">Wolf Pack</span>
                        <Zap className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="text-3xl font-bold text-white">Active</div>
                    <div className="text-sm text-purple-400 mt-1">Collector, Auditor, Guardian</div>
                </div>
            </div>

            {/* Activity Log */}
            <div className="rounded-2xl border border-[#262626] bg-[#0a0a0a] p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-gray-400" />
                    System Activity
                </h3>
                <div className="space-y-4 font-mono text-sm">
                    <div className="flex gap-4 text-gray-400">
                        <span className="text-gray-600">10:42:05</span>
                        <span className="text-blue-400">[Collector]</span>
                        <span>Fetched BTC/USDT price data.</span>
                    </div>
                    <div className="flex gap-4 text-gray-400">
                        <span className="text-gray-600">10:42:02</span>
                        <span className="text-green-400">[Guardian]</span>
                        <span>Risk check passed. Margin utilization safe (12%).</span>
                    </div>
                    <div className="flex gap-4 text-gray-400">
                        <span className="text-gray-600">10:41:55</span>
                        <span className="text-purple-400">[Auditor]</span>
                        <span>Reconciled trade #49281. Discrepancy: 0.00%.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { Terminal } from "lucide-react";
