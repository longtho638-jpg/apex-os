'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { Download, Filter, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface AuditLog {
    id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    details: any;
    ip_address: string;
    user_agent: string;
    created_at: string;
    admin_users: {
        email: string;
        role: string;
    };
}

export default function AuditLogViewer() {
    const t = useTranslations('AdminAuditLogs'); // Assuming translations exist, fallback to English keys if not
    const { fetchApi } = useApi();
    const { token } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        action: '',
        adminId: '',
        startDate: '',
        endDate: ''
    });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...filters
            });
            const data = await fetchApi(`/api/v1/admin/audit-logs?${queryParams}`);
            if (data.success) {
                // API returns data as an array of logs directly, not { logs: [], totalPages: ... }
                // Pagination is not yet implemented on the backend service
                const logsData = Array.isArray(data.data) ? data.data : [];
                setLogs(logsData);
                setTotalPages(1); // Default to 1 page for now
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchLogs();
        }
    }, [page, filters, token]); // Re-fetch when page, filters, or token changes

    const handleExport = async (format: 'csv' | 'json') => {
        try {
            const res = await fetch('/api/v1/admin/audit-logs/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ format, filters })
            });

            if (format === 'json') {
                const data = await res.json();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `audit-logs-${new Date().toISOString()}.json`;
                a.click();
            } else {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `audit-logs-${new Date().toISOString()}.csv`;
                a.click();
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-semibold text-white">System Audit Logs</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleExport('csv')}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-sm hover:bg-[#1E293B] transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-[#0F172A] border border-gray-800 rounded-xl">
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Action Type</label>
                    <select
                        className="w-full bg-[#1E293B] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                        value={filters.action}
                        onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                    >
                        <option value="">All Actions</option>
                        <option value="LOGIN">Login</option>
                        <option value="MFA_VERIFY">MFA Verify</option>
                        <option value="IP_WHITELIST_ADD">IP Whitelist Add</option>
                        <option value="IP_WHITELIST_REMOVE">IP Whitelist Remove</option>
                        <option value="UPDATE_SETTINGS">Update Settings</option>
                    </select>
                </div>
                {/* Add more filters as needed */}
            </div>

            {/* Table */}
            <div className="bg-[#0F172A] border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#1E293B] text-gray-400 border-b border-gray-700">
                            <tr>
                                <th className="px-6 py-3 font-medium">Date</th>
                                <th className="px-6 py-3 font-medium">Admin</th>
                                <th className="px-6 py-3 font-medium">Action</th>
                                <th className="px-6 py-3 font-medium">Entity</th>
                                <th className="px-6 py-3 font-medium">IP Address</th>
                                <th className="px-6 py-3 font-medium">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading logs...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                        No logs found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-[#1E293B]/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-300 whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-white font-medium">
                                            {log.admin_users?.email || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.action.includes('DELETE') || log.action.includes('REMOVE')
                                                ? 'bg-red-500/10 text-red-400'
                                                : log.action.includes('UPDATE') || log.action.includes('TOGGLE')
                                                    ? 'bg-yellow-500/10 text-yellow-400'
                                                    : 'bg-emerald-500/10 text-emerald-400'
                                                }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {log.entity_type} <span className="text-gray-600 text-xs">({log.entity_id})</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                                            {log.ip_address}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 max-w-xs truncate" title={JSON.stringify(log.details, null, 2)}>
                                            {JSON.stringify(log.details)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800 bg-[#1E293B]/30">
                    <span className="text-sm text-gray-400">
                        Page {page} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
