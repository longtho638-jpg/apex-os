'use client';

import { useState, useEffect } from 'react';
import { X, History, ArrowRight, User, Clock, FileJson } from 'lucide-react';

interface AuditLog {
    id: string;
    action: 'created' | 'updated' | 'activated' | 'deactivated' | 'deleted' | 'health_check';
    changed_fields: Record<string, any>;
    old_values: Record<string, any>;
    new_values: Record<string, any>;
    changed_by_user: { email: string } | null;
    created_at: string;
}

interface AuditLogViewerProps {
    isOpen: boolean;
    onClose: () => void;
    providerId: string;
    providerName: string;
    token: string;
}

export default function AuditLogViewer({ isOpen, onClose, providerId, providerName, token }: AuditLogViewerProps) {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && providerId) {
            fetchLogs();
        }
    }, [isOpen, providerId]);

    async function fetchLogs() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/v1/admin/providers/${providerId}/audit`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setLogs(data.logs);
            } else {
                setError(data.message || 'Failed to fetch logs');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <History className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Audit Trail</h2>
                            <p className="text-sm text-gray-400">History for <span className="text-blue-400">{providerName}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center">
                            {error}
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No audit history found for this provider.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {logs.map((log) => (
                                <div key={log.id} className="relative pl-8 border-l border-gray-700 last:border-0 pb-6 last:pb-0">
                                    {/* Timeline dot */}
                                    <div className={`absolute -left-2 top-0 w-4 h-4 rounded-full border-2 ${getActionColor(log.action)} bg-gray-900`}></div>

                                    <div className="bg-gray-800/50 border border-white/5 rounded-lg p-4 hover:border-white/10 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded ${getActionBadge(log.action)}`}>
                                                    {log.action}
                                                </span>
                                                <span className="text-sm text-gray-400 flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {log.changed_by_user?.email || 'System'}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(log.created_at).toLocaleString()}
                                            </span>
                                        </div>

                                        {/* Changes */}
                                        {log.action === 'updated' && log.changed_fields && (
                                            <div className="space-y-2">
                                                {Object.entries(log.changed_fields).map(([key, newVal]) => (
                                                    <div key={key} className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center text-sm bg-black/20 p-2 rounded">
                                                        <div className="text-red-400/80 truncate font-mono text-xs" title={JSON.stringify(log.old_values?.[key])}>
                                                            {formatValue(log.old_values?.[key])}
                                                        </div>
                                                        <ArrowRight className="w-3 h-3 text-gray-600" />
                                                        <div className="text-emerald-400/80 truncate font-mono text-xs" title={JSON.stringify(newVal)}>
                                                            {formatValue(newVal)}
                                                        </div>
                                                        <div className="col-span-3 text-xs text-gray-500 font-medium border-t border-white/5 mt-1 pt-1">
                                                            {key}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Full JSON for Create/Delete */}
                                        {(log.action === 'created' || log.action === 'deleted') && (
                                            <div className="mt-2">
                                                <details className="text-xs">
                                                    <summary className="cursor-pointer text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                                        <FileJson className="w-3 h-3" />
                                                        View Details
                                                    </summary>
                                                    <pre className="mt-2 p-2 bg-black/30 rounded text-gray-400 overflow-x-auto">
                                                        {JSON.stringify(log.new_values || log.old_values, null, 2)}
                                                    </pre>
                                                </details>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function getActionColor(action: string) {
    switch (action) {
        case 'created': return 'border-emerald-500';
        case 'updated': return 'border-blue-500';
        case 'deleted': return 'border-red-500';
        case 'activated': return 'border-green-500';
        case 'deactivated': return 'border-orange-500';
        default: return 'border-gray-500';
    }
}

function getActionBadge(action: string) {
    switch (action) {
        case 'created': return 'bg-emerald-500/20 text-emerald-400';
        case 'updated': return 'bg-blue-500/20 text-blue-400';
        case 'deleted': return 'bg-red-500/20 text-red-400';
        case 'activated': return 'bg-green-500/20 text-green-400';
        case 'deactivated': return 'bg-orange-500/20 text-orange-400';
        default: return 'bg-gray-500/20 text-gray-400';
    }
}

function formatValue(val: any): string {
    if (val === null || val === undefined) return 'null';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
}
