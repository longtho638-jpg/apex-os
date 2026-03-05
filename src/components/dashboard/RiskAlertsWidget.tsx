'use client';

import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Droplets, Fish, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';

interface Alert {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  timestamp: string;
  icon: string;
}

export function RiskAlertsWidget() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/risk/alerts');
        const data = await res.json();
        if (data.success) {
          setAlerts(data.data);
        }
      } catch (error) {
        logger.error('Failed to fetch risk alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    // Poll every 30s
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'whale':
        return <Fish className="w-5 h-5" />;
      case 'volatility':
        return <Activity className="w-5 h-5" />;
      case 'liquidity':
        return <Droplets className="w-5 h-5" />;
      case 'arbitrage':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <ShieldAlert className="w-5 h-5" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'CRITICAL':
        return 'text-red-500 border-red-500/20 bg-red-500/5';
      case 'WARNING':
        return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5';
      case 'INFO':
        return 'text-blue-500 border-blue-500/20 bg-blue-500/5';
      default:
        return 'text-zinc-500';
    }
  };

  if (loading) {
    return (
      <Card className="border-white/10 bg-black/40 backdrop-blur-md h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-zinc-400">Risk Guardian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-12 bg-white/5 rounded-lg" />
            <div className="h-12 bg-white/5 rounded-lg" />
            <div className="h-12 bg-white/5 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-black/40 backdrop-blur-md h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-500" />
            Risk Guardian
          </CardTitle>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 rounded-lg border flex items-start gap-3 ${getColor(alert.type)}`}
          >
            <div className="mt-0.5 shrink-0">{getIcon(alert.icon)}</div>
            <div>
              <h4 className="text-xs font-bold mb-0.5">{alert.title}</h4>
              <p className="text-[10px] text-zinc-400 leading-tight mb-1">{alert.message}</p>
              <span className="text-[9px] opacity-60 font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</span>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
