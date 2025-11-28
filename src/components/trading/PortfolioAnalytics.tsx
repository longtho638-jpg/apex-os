'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, TrendingUp, Activity, DollarSign } from 'lucide-react';

interface AnalyticsData {
    summary: {
        total_realized_pnl: number;
        trade_count: number;
        volume: number;
    };
    chart: {
        date: string;
        value: number;
    }[];
}

export default function PortfolioAnalytics() {
    const [range, setRange] = useState('30d');
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // In a real app, use a specialized hook or library like TanStack Query
                const res = await fetch(`/api/v1/user/analytics/pnl?range=${range}`, {
                     headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                    }
                });
                const json = await res.json();
                if (json.success) {
                    setData(json.data);
                }
            } catch (error) {
                console.error('Failed to fetch analytics', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [range]);

    if (isLoading) {
        return (
            <Card className="w-full border-zinc-800 bg-zinc-950/50 backdrop-blur-xl h-[400px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </Card>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-4 w-full">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-zinc-800 bg-zinc-900/30">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-400">Net PnL (Realized)</p>
                            <h3 className={`text-2xl font-bold ${data.summary.total_realized_pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                ${data.summary.total_realized_pnl.toLocaleString()}
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-zinc-800 bg-zinc-900/30">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                            <Activity className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-400">Total Volume</p>
                            <h3 className="text-2xl font-bold text-zinc-100">
                                ${data.summary.volume.toLocaleString()}
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-zinc-800 bg-zinc-900/30">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-400">Total Trades</p>
                            <h3 className="text-2xl font-bold text-zinc-100">
                                {data.summary.trade_count}
                            </h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Chart */}
            <Card className="border-zinc-800 bg-zinc-950/50 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Trading Activity (Volume)</CardTitle>
                    <Tabs defaultValue="30d" onValueChange={setRange} className="w-[200px]">
                        <TabsList className="grid w-full grid-cols-3 bg-zinc-900/50">
                            <TabsTrigger value="7d">7D</TabsTrigger>
                            <TabsTrigger value="30d">30D</TabsTrigger>
                            <TabsTrigger value="90d">90D</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.chart}>
                                <defs>
                                    <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#71717a" 
                                    fontSize={12} 
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis 
                                    stroke="#71717a" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }}
                                    itemStyle={{ color: '#10b981' }}
                                    labelStyle={{ color: '#a1a1aa' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#10b981" 
                                    fillOpacity={1} 
                                    fill="url(#colorVol)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
