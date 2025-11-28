'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { Calendar, DollarSign, Users, Activity, ArrowUp, ArrowDown } from 'lucide-react';

interface ProviderAnalyticsProps {
    providerId: string;
}

interface Metrics {
    date: string;
    total_volume: number;
    total_revenue: number;
    active_users: number;
    new_users: number;
}

export default function ProviderAnalytics({ providerId }: ProviderAnalyticsProps) {
    const { token } = useAuth();
    const [metrics, setMetrics] = useState<Metrics[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30'); // days

    useEffect(() => {
        fetchMetrics();
    }, [providerId, timeRange]);

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/v1/admin/providers/${providerId}/metrics?days=${timeRange}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setMetrics(data.metrics);
            }
        } catch (error) {
            console.error('Failed to fetch metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (metrics.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Activity className="w-12 h-12 mb-4 opacity-50" />
                <p>No metrics data available for this period</p>
            </div>
        );
    }

    // Calculate totals
    const totalVolume = metrics.reduce((sum, m) => sum + Number(m.total_volume), 0);
    const totalRevenue = metrics.reduce((sum, m) => sum + Number(m.total_revenue), 0);
    const totalActive = metrics[metrics.length - 1]?.active_users || 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Controls */}
            <div className="flex justify-end">
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 3 Months</option>
                </select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Activity className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-gray-400 text-sm">Total Volume</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                        ${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-gray-400 text-sm">Total Revenue</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                        ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Users className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-gray-400 text-sm">Active Users</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                        {totalActive.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Volume & Revenue Chart */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Volume & Revenue</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={metrics}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#9ca3af"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                />
                                <YAxis yAxisId="left" stroke="#9ca3af" />
                                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="total_volume"
                                    name="Volume"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={false}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="total_revenue"
                                    name="Revenue"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Users Chart */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">User Growth</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#9ca3af"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                />
                                <Legend />
                                <Bar dataKey="active_users" name="Active Users" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="new_users" name="New Users" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
