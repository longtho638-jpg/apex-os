'use client';

import { Activity, Database, Shield, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';

interface AgentStatus {
  guardian: string;
  auditor: string;
  orderManager: string;
  automationEngine: string;
  copyTrading: string;
}

interface SystemHealth {
  status: string;
  agentStatus: AgentStatus;
  databaseConnections: number;
  redisConnections: number;
}

export default function SystemHealthPanel() {
  const t = useTranslations('AdminDashboard.SystemHealth');
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch('/api/v1/admin/metrics');
        const data = await res.json();
        setHealth({
          status: data.systemHealth,
          agentStatus: data.agentStatus,
          databaseConnections: data.databaseConnections,
          redisConnections: data.redisConnections,
        });
      } catch (error) {
        logger.error('Failed to fetch health:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === 'healthy') {
      return <Badge className="bg-green-600">{t('healthy')}</Badge>;
    }
    if (status === 'degraded') {
      return <Badge className="bg-yellow-600">{t('degraded')}</Badge>;
    }
    return <Badge variant="destructive">{t('down')}</Badge>;
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

  if (!health) {
    return (
      <Card>
        <CardContent className="p-6">{t('failed_load')}</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {t('title')}
          </CardTitle>
          {getStatusBadge(health.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Agents */}
        <div>
          <p className="text-sm font-medium mb-2">{t('background_services')}</p>
          <div className="space-y-2">
            {Object.entries(health.agentStatus).map(([name, status]) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm capitalize">{name.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
                {getStatusBadge(status)}
              </div>
            ))}
          </div>
        </div>

        {/* Connections */}
        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-2">{t('connections')}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{t('database')}</span>
              </div>
              <span className="text-sm font-mono">{health.databaseConnections || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{t('redis')}</span>
              </div>
              <span className="text-sm font-mono">{health.redisConnections}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
