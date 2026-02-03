'use client';

import { logger } from '@/lib/logger';
import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Globe, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface IPWhitelistManagerProps {
    adminId: string;
}

export function IPWhitelistManager({ adminId }: IPWhitelistManagerProps) {
    const [enabled, setEnabled] = useState(false);
    const [allowedIPs, setAllowedIPs] = useState<string[]>([]);
    const [currentIP, setCurrentIP] = useState<string>('');
    const [newIP, setNewIP] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Load initial data
    useEffect(() => {
        loadWhitelist();
    }, [adminId]);

    const loadWhitelist = async () => {
        try {
            const res = await fetch(`/api/v1/admin/security/ip-whitelist?admin_id=${adminId}`);
            const data = await res.json();

            if (data.success) {
                setEnabled(data.data.enabled);
                setAllowedIPs(data.data.allowedIPs);
                setCurrentIP(data.data.currentIP);
            }
        } catch (err) {
            setError('Failed to load IP whitelist');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async () => {
        try {
            const res = await fetch('/api/v1/admin/security/ip-whitelist/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId, enabled: !enabled })
            });

            const data = await res.json();

            if (data.success) {
                setEnabled(data.enabled);
                setSuccess(data.message);
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to toggle IP whitelisting');
        }
    };

    const handleAddIP = async () => {
        if (!newIP.trim()) {
            setError('Please enter an IP address');
            return;
        }

        try {
            const res = await fetch('/api/v1/admin/security/ip-whitelist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId, ip: newIP.trim() })
            });

            const data = await res.json();

            if (data.success) {
                setAllowedIPs(data.allowedIPs);
                setNewIP('');
                setSuccess('IP added successfully');
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to add IP');
        }
    };

    const handleRemoveIP = async (ip: string) => {
        if (!confirm(`Remove ${ip} from whitelist?`)) return;

        try {
            const res = await fetch('/api/v1/admin/security/ip-whitelist', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId, ip })
            });

            if (!res.ok) {
                throw new Error('Failed to remove IP');
            }

            const data = await res.json();

            if (data.success) {
                setAllowedIPs(data.allowedIPs);
                setSuccess('IP removed successfully');
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(data.error);
            }
        } catch (err) {
            logger.error('Failed to remove IP:', err);
            setError('Failed to remove IP from whitelist');
        }
    };

    const handleAddCurrentIP = () => {
        setNewIP(currentIP);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-500" />
                        IP Whitelisting
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Restrict admin access to specific IP addresses
                    </p>
                </div>

                {/* Enable/Disable Toggle */}
                <button
                    onClick={handleToggle}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${enabled
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-gray-300'
                        }`}
                >
                    {enabled ? 'Enabled' : 'Disabled'}
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                    <button onClick={() => setError(null)} className="ml-auto text-xs">✕</button>
                </div>
            )}

            {success && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    {success}
                </div>
            )}

            {/* Current IP */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Your Current IP</p>
                        <code className="text-sm font-mono text-emerald-400">{currentIP}</code>
                    </div>
                    <button
                        onClick={handleAddCurrentIP}
                        className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors"
                    >
                        Add this IP
                    </button>
                </div>
            </div>

            {/* Add IP Form */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                    Add IP Address (supports CIDR notation)
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newIP}
                        onChange={(e) => setNewIP(e.target.value)}
                        className="flex-1 bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                        placeholder="e.g., 203.0.113.0 or 203.0.113.0/24"
                    />
                    <button
                        onClick={handleAddIP}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Use CIDR notation (e.g., 192.168.1.0/24) to whitelist IP ranges
                </p>
            </div>

            {/* IP List */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg">
                <div className="p-4 border-b border-white/10">
                    <h3 className="text-sm font-medium text-white">
                        Whitelisted IPs ({allowedIPs.length})
                    </h3>
                </div>

                {allowedIPs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <Globe className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No IPs whitelisted yet</p>
                        <p className="text-xs mt-1 opacity-70">
                            Add your current IP to get started
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {allowedIPs.map((ip, index) => (
                            <div
                                key={index}
                                className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                            >
                                <div>
                                    <code className="text-sm font-mono text-white">{ip}</code>
                                    {ip === currentIP && (
                                        <span className="ml-2 text-xs text-emerald-500">(current)</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleRemoveIP(ip)}
                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Warning */}
            {enabled && allowedIPs.length === 0 && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3 text-yellow-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-medium">Warning: No IPs whitelisted</p>
                        <p className="mt-1 opacity-90">
                            IP whitelisting is enabled but no IPs are configured. Add your current IP to avoid being locked out.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
