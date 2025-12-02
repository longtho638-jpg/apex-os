'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus, Trash2, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';

export default function IPWhitelistPage() {
    const t = useTranslations('AdminSecurity.IPWhitelist');
    const { token } = useAuth();
    const [allowedIPs, setAllowedIPs] = useState<string[]>([]);
    const [newIP, setNewIP] = useState('');
    const [currentIP, setCurrentIP] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Mock userId - in real app, get from session
    const userId = 'admin-user-id';

    useEffect(() => {
        if (token) {
            fetchAllowedIPs();
            fetchCurrentIP();
        }
    }, [token]);

    const fetchCurrentIP = async () => {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            setCurrentIP(data.ip);
        } catch (err) {
            console.error('Failed to fetch current IP:', err);
        }
    };

    const fetchAllowedIPs = async () => {
        if (!token) return;

        try {
            const res = await fetch(`/api/v1/admin/security/ip-whitelist?userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();
            if (data.success) {
                setAllowedIPs(data.allowedIPs || []);
            }
        } catch (err) {
            console.error('Failed to fetch IPs:', err);
        }
    };

    const addIP = async () => {
        if (!token || !newIP.trim()) return;

        try {
            setLoading(true);
            setError(null);

            const res = await fetch('/api/v1/admin/security/ip-whitelist', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, ip: newIP.trim() })
            });

            const data = await res.json();

            if (data.success) {
                setAllowedIPs([...allowedIPs, newIP.trim()]);
                setNewIP('');
            } else {
                setError(data.error || 'Failed to add IP');
            }
        } catch (err: any) {
            console.error('Failed to add IP:', err);
            setError('Failed to add IP');
        } finally {
            setLoading(false);
        }
    };

    const removeIP = async (ip: string) => {
        if (!token) return;

        try {
            setLoading(true);
            setError(null);

            const res = await fetch('/api/v1/admin/security/ip-whitelist', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, ipAddress: ip })
            });

            const data = await res.json();

            if (data.success) {
                setAllowedIPs(data.allowedIPs);
            } else {
                setError(data.error);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addCurrentIP = () => {
        if (currentIP) {
            setNewIP(currentIP);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-6 h-6 text-blue-600" />
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                </div>
                <p className="text-muted-foreground">
                    {t('subtitle')}
                </p>
            </div>

            {/* Current IP */}
            {currentIP && (
                <GlassCard className="mb-6 border-blue-500/20 bg-blue-500/5">

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">{t('current_ip_label')}</p>
                            <p className="text-lg font-mono font-semibold">{currentIP}</p>
                        </div>
                        <Button onClick={addCurrentIP} variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-1" />
                            {t('whitelist_current_ip')}
                        </Button>
                    </div>

                </GlassCard>
            )}

            {/* Add New IP */}
            <GlassCard className="mb-6">

                <h3 className="text-lg font-bold mb-4">{t('add_new_ip')}</h3>


                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newIP}
                        onChange={(e) => setNewIP(e.target.value)}
                        placeholder="192.168.1.1"
                        className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    />
                    <Button
                        onClick={addIP}
                        disabled={loading || !newIP}
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        {t('add_ip_button')}
                    </Button>
                </div>

                {error && (
                    <div className="mt-3 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

            </GlassCard>

            {/* Allowed IPs List */}
            <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">{t('whitelisted_ips')} ({allowedIPs.length})</h3>
                    {allowedIPs.length === 0 && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600/20">
                            <Globe className="w-3 h-3 mr-1" />
                            {t('all_ips_allowed')}
                        </Badge>
                    )}
                </div>

                {allowedIPs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>{t('no_restrictions')}</p>
                        <p className="text-sm">{t('access_allowed_all')}</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {allowedIPs.map((ip) => (
                            <div
                                key={ip}
                                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Shield className="w-4 h-4 text-green-600" />
                                    <span className="font-mono font-semibold">{ip}</span>
                                    {ip === currentIP && (
                                        <Badge variant="outline" className="text-blue-600 border-blue-600/20">
                                            {t('current')}
                                        </Badge>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeIP(ip)}
                                    disabled={loading}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

            </GlassCard>

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>⚠️ {t('warning_title')}:</strong> {t('warning_message')}
                </p>
            </div>
        </div>
    );
}
