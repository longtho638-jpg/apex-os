'use client';

import { Download, FileText, Filter, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { type AuditLog, auditService } from '@/lib/audit';
import { logger } from '@/lib/logger';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'user' | 'security'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days
      const endDate = new Date();

      const data = await auditService.getLogsByDateRange(startDate, endDate, 100);
      setLogs(data);
    } catch (error) {
      logger.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const exportCSV = async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();

    const csv = await auditService.exportLogs(startDate, endDate);

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredLogs = logs.filter((log) => {
    if (
      filter === 'security' &&
      !log.action.includes('SECURITY') &&
      !log.action.includes('IP') &&
      !log.action.includes('MFA')
    ) {
      return false;
    }
    if (searchQuery && !log.action.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('CREATE')) return <Badge className="bg-green-600">CREATE</Badge>;
    if (action.includes('UPDATE')) return <Badge className="bg-blue-600">UPDATE</Badge>;
    if (action.includes('DELETE')) return <Badge variant="destructive">DELETE</Badge>;
    if (action.includes('SECURITY') || action.includes('IP') || action.includes('MFA')) {
      return <Badge className="bg-orange-600">SECURITY</Badge>;
    }
    return <Badge variant="outline">{action}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold">Audit Logs</h1>
            </div>
            <p className="text-muted-foreground">Complete trail of all administrative actions</p>
          </div>
          <Button onClick={exportCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex gap-2">
            <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
              All Logs
            </Button>
            <Button
              variant={filter === 'security' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('security')}
            >
              <Filter className="w-4 h-4 mr-1" />
              Security Only
            </Button>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search actions..."
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <Button variant="ghost" size="sm" onClick={fetchLogs}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold mb-4">Audit Trail ({filteredLogs.length} records)</h3>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading audit logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No audit logs found</div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getActionBadge(log.action)}
                    <span className="font-semibold">{log.action}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  {log.userId && (
                    <div>
                      <p className="text-muted-foreground">User ID</p>
                      <p className="font-mono text-xs">{log.userId.substring(0, 8)}...</p>
                    </div>
                  )}
                  {log.resourceType && (
                    <div>
                      <p className="text-muted-foreground">Resource</p>
                      <p>{log.resourceType}</p>
                    </div>
                  )}
                  {log.ipAddress && (
                    <div>
                      <p className="text-muted-foreground">IP Address</p>
                      <p className="font-mono">{log.ipAddress}</p>
                    </div>
                  )}
                </div>

                {(log.oldValue || log.newValue) && (
                  <details className="mt-2">
                    <summary className="text-sm text-blue-600 cursor-pointer hover:underline">View details</summary>
                    <div className="mt-2 p-3 bg-muted rounded text-xs">
                      {log.oldValue && (
                        <div className="mb-2">
                          <p className="font-semibold">Old Value:</p>
                          <pre className="overflow-auto">{JSON.stringify(log.oldValue, null, 2)}</pre>
                        </div>
                      )}
                      {log.newValue && (
                        <div>
                          <p className="font-semibold">New Value:</p>
                          <pre className="overflow-auto">{JSON.stringify(log.newValue, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>ℹ️ Retention:</strong> Audit logs are retained for 90 days. Older logs are automatically archived.
        </p>
      </div>
    </div>
  );
}
