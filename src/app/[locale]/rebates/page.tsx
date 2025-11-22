"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/os/sidebar';
import { Coins, RefreshCw, Download, Calculator } from 'lucide-react';
import { useRebates } from '@/hooks/useRebates';
import { calculateEstimatedRebate } from '@/lib/api/rebates';
import { cn } from '@/lib/utils';

export default function RebatesPage() {
    const { data, loading, error, refetch } = useRebates(60000); // Poll every minute
    const [calcVolume, setCalcVolume] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Pagination
    const paginatedHistory = data?.rebate_history?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    ) || [];
    const totalPages = Math.ceil((data?.rebate_history?.length || 0) / itemsPerPage);

    // CSV Export
    const exportCSV = () => {
        if (!data) return;

        const csv = [
            ['Date', 'Amount', 'Trades', 'Exchange'],
            ...data.rebate_history.map(r => [r.date, r.amount, r.trades_count, r.exchange])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rebates-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Background Ambient Glow */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-20%] right-[10%] w-[600px] h-[600px] bg-[#00FF94]/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] left-[10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
                </div>

                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 z-10 border-b border-white/5 bg-[#030303]/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#00FF94]/10 rounded-lg border border-[#00FF94]/20 shadow-[0_0_15px_rgba(0,255,148,0.1)]">
                            <Coins className="h-5 w-5 text-[#00FF94]" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">Kiếm Toàn Phí</h1>
                            <p className="text-xs text-gray-400">Rebates & Rewards</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportCSV}
                            disabled={!data || data.rebate_history.length === 0}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all disabled:opacity-50"
                        >
                            <Download className="h-4 w-4" />
                            <span className="text-xs font-medium">Export CSV</span>
                        </button>

                        <button
                            onClick={refetch}
                            disabled={loading}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                        >
                            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto z-10">
                    {/* Error State */}
                    {error && (
                        <div className="glass-card rounded-xl p-6 border-red-500/20 bg-red-500/5">
                            <p className="text-red-400 mb-2 font-medium">Error loading rebates</p>
                            <p className="text-sm text-gray-400">{error.message}</p>
                            <button
                                onClick={refetch}
                                className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-all"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && !data && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                {[1, 2].map((i) => (
                                    <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                                        <div className="h-4 bg-white/10 rounded w-24 mb-4" />
                                        <div className="h-8 bg-white/10 rounded w-32" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Data Display */}
                    {data && !loading && (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="glass-card rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-400">Total Rebates Earned</span>
                                        <Coins className="h-4 w-4 text-[#00FF94]" />
                                    </div>
                                    <div className="text-3xl font-bold text-[#00FF94]">
                                        ${data.total_rebates.toFixed(2)}
                                    </div>
                                </div>

                                <div className="glass-card rounded-xl p-6">
                                    <span className="text-sm text-gray-400 block mb-2">Monthly Average</span>
                                    <div className="text-3xl font-bold text-white">
                                        ${data.monthly_average.toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            {/* Rebate Calculator */}
                            <div className="glass-card rounded-xl p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Calculator className="h-5 w-5 text-blue-400" />
                                    <h2 className="text-lg font-bold">Rebate Calculator</h2>
                                </div>
                                <div className="flex gap-4 items-end">
                                    <div className="flex-1">
                                        <label className="text-sm text-gray-400 block mb-2">Trading Volume (USD)</label>
                                        <input
                                            type="number"
                                            value={calcVolume}
                                            onChange={(e) => setCalcVolume(e.target.value)}
                                            placeholder="Enter volume..."
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF94]/50"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm text-gray-400 block mb-2">Estimated Rebate</label>
                                        <div className="px-4 py-2 bg-[#00FF94]/10 border border-[#00FF94]/20 rounded-lg text-[#00FF94] font-bold">
                                            ${calcVolume ? calculateEstimatedRebate(parseFloat(calcVolume)).toFixed(2) : '0.00'}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-3">* Based on 0.02% rebate rate</p>
                            </div>

                            {/* Rebate History Table */}
                            <div className="glass-card rounded-xl p-6">
                                <h2 className="text-lg font-bold mb-4">Rebate History</h2>

                                {data.rebate_history.length > 0 ? (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="text-left text-sm text-gray-400 border-b border-white/10">
                                                        <th className="pb-3">Date</th>
                                                        <th className="pb-3 text-right">Amount</th>
                                                        <th className="pb-3 text-right">Trades</th>
                                                        <th className="pb-3">Exchange</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm">
                                                    {paginatedHistory.map((rebate, idx) => (
                                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                                                            <td className="py-3 text-gray-300">{rebate.date}</td>
                                                            <td className="py-3 text-right font-bold text-[#00FF94]">
                                                                ${rebate.amount.toFixed(2)}
                                                            </td>
                                                            <td className="py-3 text-right text-gray-300">{rebate.trades_count}</td>
                                                            <td className="py-3 text-gray-300">{rebate.exchange}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-between mt-6">
                                                <div className="text-sm text-gray-400">
                                                    Page {currentPage} of {totalPages}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                        disabled={currentPage === 1}
                                                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 text-sm"
                                                    >
                                                        Previous
                                                    </button>
                                                    <button
                                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                        disabled={currentPage === totalPages}
                                                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 text-sm"
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="py-12 text-center text-gray-400">
                                        <Coins className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                                        <p>No rebates earned yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
