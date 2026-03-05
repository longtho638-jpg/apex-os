'use client';

import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { logger } from '@/lib/logger';

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: any;
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED';
  created_at: string;
}

export default function AlertsViewer() {
  const { fetchApi } = useApi();
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const query = filterStatus ? `?status=${filterStatus}` : '';
      const response = await fetchApi(`/api/v1/admin/security/alerts${query}`);
      if (response.success) {
        setAlerts(response.data);
      }
    } catch (error) {
      logger.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadAlerts();
    }
  }, [token, loadAlerts]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'HIGH':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'MEDIUM':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default:
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Security Alerts</h2>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
          <button
            onClick={loadAlerts}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-3">Severity</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Details</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Loading alerts...
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No alerts found. System is secure.
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(alert.severity)}`}
                      >
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white font-medium">{alert.type}</td>
                    <td className="px-6 py-4 text-gray-400 max-w-md truncate">{JSON.stringify(alert.details)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium ${
                          alert.status === 'OPEN' ? 'text-green-400' : 'text-gray-500'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {format(new Date(alert.created_at), 'MMM d, HH:mm:ss')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
