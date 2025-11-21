"use client";

import { Sidebar } from '@/components/os/sidebar';
import { useUserTier } from '@/hooks/useUserTier';
import {
    FileText, Download, Calendar, TrendingUp,
    DollarSign, ArrowRight, CheckCircle, Lock,
    Filter, Search, MoreHorizontal
} from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Mock report data
const MOCK_REPORTS = [
    {
        id: 'RPT-001',
        type: 'Performance',
        period: 'November 2024',
        generated: '2024-11-20',
        size: '124 KB',
        format: 'PDF',
        status: 'Ready'
    },
    {
        id: 'RPT-002',
        type: 'Tax Summary',
        period: 'Q3 2024',
        generated: '2024-10-15',
        size: '89 KB',
        format: 'PDF',
        status: 'Ready'
    },
    {
        id: 'RPT-003',
        type: 'Fee Audit',
        period: 'October 2024',
        generated: '2024-11-01',
        size: '56 KB',
        format: 'CSV',
        status: 'Archived'
    },
];

export default function ReportsPage() {
    const { isFree, isFounders, loading: tierLoading } = useUserTier();
    const [generatingReport, setGeneratingReport] = useState(false);
    const t = useTranslations('Reports');

    const handleGenerateReport = (type: string) => {
        setGeneratingReport(true);
        // Simulate report generation
        setTimeout(() => {
            setGeneratingReport(false);
            alert(t('demo_alert', { type }));
        }, 2000);
    };

    if (tierLoading) {
        return <div className="bg-[#030303] h-screen w-full" />;
    }

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden selection:bg-[#00FF94]/20">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Background Ambient Glow */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#8B5CF6]/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#00FF94]/5 rounded-full blur-[120px]" />
                </div>

                {/* Header */}
                <header className="h-20 flex items-center justify-between px-8 z-10 border-b border-white/5 bg-[#030303]/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-[#8B5CF6]/10 rounded-xl border border-[#8B5CF6]/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                            <FileText className="h-6 w-6 text-[#8B5CF6]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-white">{t('title')}</h2>
                            <p className="text-xs text-gray-500">Manage and export your trading data</p>
                        </div>
                    </div>
                    {isFounders && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleGenerateReport('Performance')}
                                disabled={generatingReport}
                                className="px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {generatingReport ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {t('generating')}
                                    </>
                                ) : (
                                    <>
                                        <TrendingUp className="h-4 w-4" />
                                        {t('generate_new')}
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar z-10">
                    <div className="max-w-6xl mx-auto space-y-8">

                        {/* Free User Lock */}
                        {isFree && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-panel rounded-2xl p-8 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/10 to-[#EC4899]/10 opacity-50 group-hover:opacity-70 transition-opacity" />
                                <div className="relative z-10 flex items-start gap-6">
                                    <div className="p-4 bg-[#8B5CF6]/20 rounded-2xl border border-[#8B5CF6]/30 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                                        <Lock className="h-8 w-8 text-[#8B5CF6]" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-white mb-2">
                                            {t('founders_only_title')}
                                        </h3>
                                        <p className="text-gray-400 mb-6 max-w-2xl leading-relaxed">
                                            {t('founders_only_desc')}
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                            {[
                                                { icon: FileText, label: t('feature_pdf') },
                                                { icon: DollarSign, label: t('feature_tax') },
                                                { icon: Calendar, label: t('feature_custom_date') },
                                                { icon: Download, label: t('feature_excel') },
                                            ].map((feature, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                                    <CheckCircle className="h-4 w-4 text-[#00FF94]" />
                                                    <span className="text-sm text-gray-300">{feature.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="px-8 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#7C3AED] hover:to-[#DB2777] text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center gap-2 group/btn">
                                            {t('upgrade_button')}
                                            <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Quick Generate - Founders Only */}
                        {isFounders && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <QuickReportCard
                                    title={t('quick_performance_title')}
                                    description={t('quick_performance_desc')}
                                    icon={TrendingUp}
                                    format="PDF"
                                    color="text-[#00FF94]"
                                    bg="bg-[#00FF94]/10"
                                    border="border-[#00FF94]/20"
                                    onClick={() => handleGenerateReport('Performance')}
                                    disabled={generatingReport}
                                    delay={0}
                                />
                                <QuickReportCard
                                    title={t('quick_tax_title')}
                                    description={t('quick_tax_desc')}
                                    icon={FileText}
                                    format="PDF"
                                    color="text-[#8B5CF6]"
                                    bg="bg-[#8B5CF6]/10"
                                    border="border-[#8B5CF6]/20"
                                    onClick={() => handleGenerateReport('Tax')}
                                    disabled={generatingReport}
                                    delay={0.1}
                                />
                                <QuickReportCard
                                    title={t('quick_fee_title')}
                                    description={t('quick_fee_desc')}
                                    icon={DollarSign}
                                    format="CSV/Excel"
                                    color="text-[#06B6D4]"
                                    bg="bg-[#06B6D4]/10"
                                    border="border-[#06B6D4]/20"
                                    onClick={() => handleGenerateReport('Fee')}
                                    disabled={generatingReport}
                                    delay={0.2}
                                />
                            </div>
                        )}

                        {/* Report History */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-panel rounded-2xl overflow-hidden flex flex-col"
                        >
                            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <h3 className="font-bold text-lg text-white">{t('history_title')}</h3>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search reports..."
                                            className="pl-9 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#8B5CF6]/50 transition-colors w-64"
                                        />
                                    </div>
                                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10">
                                        <Filter className="h-4 w-4 text-gray-400" />
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-white/[0.02]">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('col_id')}</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('col_type')}</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('col_period')}</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('col_generated')}</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('col_format')}</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{t('col_action')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {(isFree ? MOCK_REPORTS.slice(0, 1) : MOCK_REPORTS).map((report) => (
                                            <tr key={report.id} className="group hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400 group-hover:text-white transition-colors">
                                                    {report.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("h-2 w-2 rounded-full", report.type === 'Performance' ? "bg-[#00FF94]" : report.type === 'Tax Summary' ? "bg-[#8B5CF6]" : "bg-[#06B6D4]")} />
                                                        <span className="text-sm font-medium text-white">{report.type}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                    {report.period}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {report.generated}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                                                        report.format === 'PDF'
                                                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                            : "bg-green-500/10 text-green-400 border-green-500/20"
                                                    )}>
                                                        {report.format}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    {(isFree && report.format === 'PDF') ? (
                                                        <span className="text-xs text-gray-600 flex items-center justify-end gap-1">
                                                            <Lock className="h-3 w-3" />
                                                            {t('founders_only_badge')}
                                                        </span>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                                                                <Download className="h-4 w-4" />
                                                            </button>
                                                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>

                        {/* Free tier teaser */}
                        {isFree && (
                            <div className="text-center p-8 border border-dashed border-white/10 rounded-2xl">
                                <Lock className="h-6 w-6 text-gray-600 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">
                                    {t('more_reports', { count: MOCK_REPORTS.length - 1 })}
                                </p>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}

// Components
function QuickReportCard({ title, description, icon: Icon, format, color, bg, border, onClick, disabled, delay }: any) {
    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            onClick={onClick}
            disabled={disabled}
            className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
        >
            <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-20", bg.replace('/10', ''))} />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className={cn("h-12 w-12 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110 duration-300", bg, border)}>
                        <Icon className={cn("h-6 w-6", color)} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 border border-white/10 px-2 py-1 rounded bg-black/20">{format}</span>
                </div>

                <h4 className="font-bold text-white text-lg mb-1 group-hover:text-[#00FF94] transition-colors">{title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
            </div>
        </motion.button>
    );
}
