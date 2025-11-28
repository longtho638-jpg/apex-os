'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from '@/contexts/I18nContext';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign } from 'lucide-react';

// Mock data generator for volatility
const generateData = (count: number) => {
    const data = [];
    let value = 5000;
    for (let i = 0; i < count; i++) {
        const change = (Math.random() - 0.45) * 200; // Slight upward trend
        value += change;
        data.push({
            time: new Date(Date.now() - (count - i) * 1000).toLocaleTimeString(),
            value: Math.max(0, value),
            profit: Math.max(0, value * 0.15) // Net profit margin
        });
    }
    return data;
};

export default function NetProfitChart() {
    const t = useTranslations('AdminDashboard.NetProfit');
    const [data, setData] = useState(generateData(60));
    const [currentProfit, setCurrentProfit] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => {
                const lastValue = prev[prev.length - 1].value;
                const change = (Math.random() - 0.45) * 200;
                const newValue = Math.max(0, lastValue + change);
                const newPoint = {
                    time: new Date().toLocaleTimeString(),
                    value: newValue,
                    profit: newValue * 0.15
                };

                setCurrentProfit(newPoint.profit);
                return [...prev.slice(1), newPoint];
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="bg-black border border-[#00FF94]/20 shadow-[0_0_20px_rgba(0,255,148,0.05)]">
            <CardHeader className="border-b border-gray-800 pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-[#00FF94] flex items-center gap-2 font-mono uppercase tracking-wider text-sm">
                        <TrendingUp className="w-4 h-4" />
                        {t('title')}
                    </CardTitle>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-[#00FF94] font-mono">
                            ${currentProfit.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">{t('live_pnl')}</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00FF94" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#00FF94" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                        <XAxis
                            dataKey="time"
                            hide={true}
                        />
                        <YAxis
                            orientation="right"
                            stroke="#333"
                            tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }}
                            tickFormatter={(value) => `$${value}`}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#00FF94' }}
                            itemStyle={{ color: '#00FF94' }}
                            labelStyle={{ color: '#666' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="profit"
                            stroke="#00FF94"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorProfit)"
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
