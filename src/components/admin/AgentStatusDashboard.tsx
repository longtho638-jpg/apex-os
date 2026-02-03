'use client';

import { logger } from '@/lib/logger';
import React, { useState, useEffect } from 'react';
import { useApiClient } from '@/hooks/useApi';
import { Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface AgentStatus {
    id: string;
    agent_name: string;
    status: 'RUNNING' | 'STOPPED' | 'ERROR';
    last_check_at: string;
    error_message?: string;
    isHealthy: boolean;
    minutesSinceLastCheck: number;
}

export default function AgentStatusDashboard() {
    const { api } = useApiClient();
    const [agents, setAgents] = useState<AgentStatus[]>([]);
    const [loading, setLoading] = useState(true);

    const loadAgentStatus = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/v1/admin/agents/status');
            if (response.success) {
                setAgents(response.data);
            }
        } catch (error) {
            logger.error('Failed to load agent status:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAgentStatus();
        const interval = setInterval(loadAgentStatus, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const getStatusIcon = (agent: AgentStatus) => {
        if (agent.isHealthy) {
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        } else if (agent.status === 'ERROR') {
            return <AlertCircle className="h-5 w-5 text-red-500" />;
        } else {
            return <Clock className="h-5 w-5 text-yellow-500" />;
        }
    };

    const getStatusColor = (agent: AgentStatus) => {
        if (agent.isHealthy) return 'bg-green-500/10 border-green-500/20 text-green-400';
        if (agent.status === 'ERROR') return 'bg-red-500/10 border-red-500/20 text-red-400';
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
    };

    const getStatusText = (agent: AgentStatus) => {
        if (agent.isHealthy) return 'Running';
        if (agent.status === 'ERROR') return 'Error';
        if (agent.minutesSinceLastCheck > 5) return 'Dead';
        return agent.status;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Agent Status Dashboard</h2>
                <button
                    onClick={loadAgentStatus}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors flex items-center gap-2"
                >
                    <Activity className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                    <div className="col-span-2 text-center text-gray-500 py-8">
                        Loading agent status...
                    </div>
                ) : agents.length === 0 ? (
                    <div className="col-span-2 text-center text-gray-500 py-8">
                        No agents found. Run agents to see their status.
                    </div>
                ) : (
                    agents.map((agent) => (
                        <div
                            key={agent.id}
                            className="bg-[#111111] border border-white/10 rounded-xl p-6 space-y-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(agent)}
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">
                                            {agent.agent_name}
                                        </h3>
                                        <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(agent)}`}>
                                            {getStatusText(agent)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-400">
                                    <span>Last Check:</span>
                                    <span className="text-white">
                                        {agent.minutesSinceLastCheck < 1
                                            ? 'Just now'
                                            : `${agent.minutesSinceLastCheck}m ago`}
                                    </span>
                                </div>
                                {agent.error_message && (
                                    <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs">
                                        {agent.error_message}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {!loading && agents.length > 0 && (
                <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Activity className="h-4 w-4" />
                        <span>
                            Auto-refresh every 30 seconds
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
