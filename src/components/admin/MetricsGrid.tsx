'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from '@/contexts/I18nContext';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, AlertTriangle } from 'lucide-react';

interface Metrics {
    activeUsers: number;
    totalVolume24h: number;
    pendingPayouts: number;
    revenue24h: number;
    systemHealth: 'healthy' | 'degraded' | 'down';
}

export default function MetricsGrid() {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await fetch('/api/v1/admin/metrics');
                const data = await res.json();
                setMetrics(data);
            } catch (error) {
                console.error('Failed to fetch metrics:', error);
            } finally {
                setLoading(false);
            }
        };

        // Initial fetch
        fetchMetrics();

        // Auto-refresh every 10s
        const interval = setInterval(fetchMetrics, 10000);

        return () => clearInterval(interval);
    }, []);

    const t = useTranslations('AdminDashboard.Metrics');

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="h-20 bg-gray-200 rounded"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!metrics) {
        return <div className="text-center text-muted-foreground">{t('failed_load')}</div>;
    }

    const getHealthColor = () => {
        if (metrics.systemHealth === 'healthy') return 'text-green-600 bg-green-100';
        if (metrics.systemHealth === 'degraded') return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const cards = [
        {
            title: t('active_users'),
            value: metrics.activeUsers,
            icon: Users,
            color: 'text-blue-600 bg-blue-100',
            suffix: '',
        },
        {
            title: t('volume_24h'),
            value: `$${metrics.totalVolume24h.toLocaleString()}`,
            icon: TrendingUp,
            color: 'text-green-600 bg-green-100',
            suffix: '',
        },
        {
            title: t('revenue_24h'),
            value: `$${metrics.revenue24h.toLocaleString()}`,
            icon: DollarSign,
            color: 'text-purple-600 bg-purple-100',
            suffix: '',
        },
        {
            title: t('system_health'),
            value: metrics.systemHealth.toUpperCase(),
            icon: AlertTriangle,
            color: getHealthColor(),
            suffix: '',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                                <div className={`p-2 rounded-lg ${card.color}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="flex items-baseline">
                                <p className="text-2xl font-bold">{card.value}</p>
                                {card.suffix && (
                                    <span className="ml-2 text-sm text-muted-foreground">{card.suffix}</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
