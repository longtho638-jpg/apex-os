'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClientSide } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Users, Mail, Activity, TrendingUp } from 'lucide-react';

export default function CRMDashboard() {
    const [pipelines, setPipelines] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = getSupabaseClientSide();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch Pipelines
            const { data: pipelineData } = await supabase
                .from('crm_pipelines')
                .select('*')
                .order('last_interaction', { ascending: false })
                .limit(50);

            if (pipelineData) setPipelines(pipelineData);

            // Fetch Recent Events
            const { data: eventData } = await supabase
                .from('crm_events')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (eventData) setEvents(eventData);
        } catch (error) {
            console.error('Error fetching CRM data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'LEAD_NEW': return 'text-gray-400';
            case 'LEAD_QUALIFIED': return 'text-blue-400';
            case 'OPPORTUNITY_ACTIVE': return 'text-yellow-400';
            case 'CUSTOMER_PAID': return 'text-green-400';
            case 'CUSTOMER_VIP': return 'text-purple-400';
            case 'CHURN_RISK': return 'text-red-400';
            default: return 'text-white';
        }
    };

    return (
        <div className="p-6 space-y-6 bg-black min-h-screen text-white">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-[#00FF94]">The Beehive (CRM)</h1>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-gray-800 rounded-full text-xs">Total Bees: {pipelines.length}</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-[#111] border-gray-800 p-4">
                    <div className="flex items-center gap-3">
                        <Users className="text-[#00FF94]" />
                        <div>
                            <p className="text-gray-400 text-sm">Active Leads</p>
                            <p className="text-xl font-bold">{pipelines.filter(p => p.stage.includes('LEAD')).length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-[#111] border-gray-800 p-4">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="text-yellow-400" />
                        <div>
                            <p className="text-gray-400 text-sm">Opportunities</p>
                            <p className="text-xl font-bold">{pipelines.filter(p => p.stage === 'OPPORTUNITY_ACTIVE').length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-[#111] border-gray-800 p-4">
                    <div className="flex items-center gap-3">
                        <Activity className="text-green-400" />
                        <div>
                            <p className="text-gray-400 text-sm">Paid Customers</p>
                            <p className="text-xl font-bold">{pipelines.filter(p => p.stage.includes('CUSTOMER')).length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-[#111] border-gray-800 p-4">
                    <div className="flex items-center gap-3">
                        <Mail className="text-blue-400" />
                        <div>
                            <p className="text-gray-400 text-sm">Recent Events</p>
                            <p className="text-xl font-bold">{events.length}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pipeline View */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold">User Pipeline</h2>
                    <div className="bg-[#111] rounded-lg border border-gray-800 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-900 text-gray-400">
                                <tr>
                                    <th className="p-3">User ID</th>
                                    <th className="p-3">Stage</th>
                                    <th className="p-3">Score</th>
                                    <th className="p-3">Ghost Profit</th>
                                    <th className="p-3">Sentiment</th>
                                    <th className="p-3">Last Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="p-4 text-center">Scanning Hive...</td></tr>
                                ) : pipelines.map((p) => (
                                    <tr key={p.user_id} className="border-t border-gray-800 hover:bg-gray-900/50">
                                        <td className="p-3 font-mono text-xs text-gray-500">{p.user_id.slice(0, 8)}...</td>
                                        <td className={`p-3 font-bold ${getStageColor(p.stage)}`}>{p.stage}</td>
                                        <td className="p-3">{p.score}</td>
                                        <td className="p-3">${(Math.random() * 1000).toFixed(0)}</td> {/* Mocked Ghost Profit */}
                                        <td className="p-3 text-xs text-yellow-500">Risk Averse</td> {/* Mocked Sentiment */}
                                        <td className="p-3 text-gray-400">{new Date(p.last_interaction).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {!loading && pipelines.length === 0 && (
                                    <tr><td colSpan={6} className="p-4 text-center text-gray-500">No bees in the hive yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Live Feed */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Live Intelligence</h2>
                    <div className="bg-[#111] rounded-lg border border-gray-800 p-4 h-[500px] overflow-y-auto space-y-3">
                        {loading ? (
                            <p className="text-center text-gray-500">Listening...</p>
                        ) : events.map((e) => (
                            <div key={e.id} className="flex gap-3 text-sm border-b border-gray-800 pb-2 last:border-0">
                                <div className={`w-2 h-2 mt-1.5 rounded-full ${e.severity === 'SUCCESS' ? 'bg-green-500' : e.severity === 'WARN' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                                <div>
                                    <p className="font-semibold text-gray-300">{e.event_type}</p>
                                    <p className="text-xs text-gray-500">{new Date(e.created_at).toLocaleTimeString()}</p>
                                    <p className="text-xs text-gray-600 font-mono mt-1">{JSON.stringify(e.metadata).slice(0, 50)}</p>
                                </div>
                            </div>
                        ))}
                        {!loading && events.length === 0 && (
                            <p className="text-center text-gray-500">No signals detected.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
