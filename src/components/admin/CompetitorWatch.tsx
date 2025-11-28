'use client';

import React from 'react';
import { useTranslations } from '@/contexts/I18nContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crosshair, ArrowUp, ArrowDown, Minus } from 'lucide-react';

const competitors = [
    { name: 'Binance', rebate: '40%', trend: 'stable', diff: '-5%' },
    { name: 'Bybit', rebate: '45%', trend: 'up', diff: '0%' },
    { name: 'OKX', rebate: '35%', trend: 'down', diff: '-10%' },
    { name: 'Bitget', rebate: '50%', trend: 'up', diff: '+5%' },
];

export default function CompetitorWatch() {
    const t = useTranslations('AdminDashboard.CompetitorWatch');

    return (
        <Card className="bg-black border border-gray-800">
            <CardHeader className="border-b border-gray-800 pb-2">
                <CardTitle className="text-gray-400 flex items-center gap-2 font-mono uppercase tracking-wider text-sm">
                    <Crosshair className="w-4 h-4" />
                    {t('title')}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <table className="w-full text-sm font-mono">
                    <thead>
                        <tr className="text-gray-600 border-b border-gray-900">
                            <th className="text-left p-3">{t('exchange')}</th>
                            <th className="text-right p-3">{t('rebate')}</th>
                            <th className="text-right p-3">{t('trend')}</th>
                            <th className="text-right p-3">{t('vs_us')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {competitors.map((comp) => (
                            <tr key={comp.name} className="border-b border-gray-900 hover:bg-gray-900/50 transition-colors">
                                <td className="p-3 font-bold text-gray-300">{comp.name}</td>
                                <td className="p-3 text-right text-[#00FF94]">{comp.rebate}</td>
                                <td className="p-3 text-right flex justify-end">
                                    {comp.trend === 'up' && <ArrowUp className="w-4 h-4 text-red-500" />}
                                    {comp.trend === 'down' && <ArrowDown className="w-4 h-4 text-[#00FF94]" />}
                                    {comp.trend === 'stable' && <Minus className="w-4 h-4 text-gray-500" />}
                                </td>
                                <td className={`p-3 text-right ${comp.diff.startsWith('+') ? 'text-red-500' : 'text-[#00FF94]'}`}>
                                    {comp.diff}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-3 border-t border-gray-800 bg-gray-900/20">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">{t('our_rate')}</span>
                        <span className="text-[#00FF94] font-bold text-lg">45%</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
