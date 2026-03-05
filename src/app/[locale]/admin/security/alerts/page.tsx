'use client';

import AlertsViewer from '@/components/admin/AlertsViewer';

export default function SecurityAlertsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Security Center</h1>
        <p className="text-zinc-400">Monitor active threats and system anomalies detected by Guardian Agent.</p>
      </div>

      <AlertsViewer />
    </div>
  );
}
