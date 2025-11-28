'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from '@/contexts/I18nContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Clock } from 'lucide-react';

interface Alert {
    id: string;
    alert_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    created_at: string;
    acknowledged: boolean;
}

export default function AlertsPanel() {
    const t = useTranslations('AdminDashboard.Alerts');
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const res = await fetch('/api/v1/admin/metrics');
                const data = await res.json();
                setAlerts(data.recentAlerts || []);
            } catch (error) {
                console.error('Failed to fetch alerts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
        const interval = setInterval(fetchAlerts, 10000);

        return () => clearInterval(interval);
    }, []);

    const getSeverityBadge = (severity: string) => {
        const colors = {
            low: 'bg-blue-600',
            medium: 'bg-yellow-600',
            high: 'bg-orange-600',
            critical: 'bg-red-600',
        };
        return <Badge className={colors[severity as keyof typeof colors] || 'bg-gray-600'}>{severity.toUpperCase()}</Badge>;
    };

    const getTimeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return `${seconds}${t('ago_s')}`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}${t('ago_m')}`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}${t('ago_h')}`;
        return `${Math.floor(hours / 24)}${t('ago_d')}`;
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6 animate-pulse">
                    <div className="h-40 bg-gray-200 rounded"></div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        {t('title')} ({alerts.length})
                    </CardTitle>
                    {alerts.length > 0 && (
                        <Button variant="outline" size="sm">
                            {t('view_all')}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {alerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>{t('no_alerts')}</p>
                        <p className="text-sm">{t('all_normal')}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {alerts.slice(0, 5).map((alert) => (
                            <div
                                key={alert.id}
                                className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {getSeverityBadge(alert.severity)}
                                        <span className="font-medium text-sm">{alert.alert_type}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        {getTimeAgo(alert.created_at)}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{alert.message}</p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
