'use client';

import { AlertTriangle, CheckCircle, ChevronRight, Clock } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import RequestDetailModal from './RequestDetailModal';

interface ApprovalRequest {
  id: string;
  action_type: string;
  payload: any;
  status: string;
  created_at: string;
  requester: {
    email: string;
    full_name: string;
  };
  approvals: {
    admin_id: string;
    approved_at: string;
  }[];
}

export default function ApprovalQueue() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchRequests = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/admin/approvals');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.data);
      }
    } catch (error) {
      logger.error('Failed to fetch approvals:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const handleActionComplete = () => {
    setSelectedRequest(null);
    fetchRequests();
  };

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-white/5 rounded-xl" />;
  }

  return (
    <div className="glass-panel p-6 rounded-xl border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center border border-[#F59E0B]/30">
            <Clock className="h-5 w-5 text-[#F59E0B]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Approval Queue</h3>
            <p className="text-sm text-gray-400">Pending multi-sig requests</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold rounded-full border border-[#F59E0B]/30">
          {requests.length} PENDING
        </div>
      </div>

      <div className="space-y-3">
        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border border-dashed border-white/10 rounded-lg">
            No pending requests. All clear!
          </div>
        ) : (
          requests.map((req) => {
            const hasApproved = req.approvals.some((a) => a.admin_id === user?.id);
            const isRequester = req.requester.email === user?.email;

            return (
              <div
                key={req.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5 hover:border-[#F59E0B]/30 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
                  </div>
                  <div>
                    <div className="font-medium text-white flex items-center gap-2">
                      {req.action_type}
                      {isRequester && (
                        <span className="text-[10px] bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">YOU</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Requested by{' '}
                      <span className="text-gray-300">{req.requester.full_name || req.requester.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-gray-400">Approvals</div>
                    <div className="text-sm font-mono text-white">{req.approvals.length} / 2</div>
                  </div>

                  <button
                    onClick={() => setSelectedRequest(req)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${
                      hasApproved
                        ? 'bg-green-500/20 text-green-400 cursor-default'
                        : 'bg-[#F59E0B] text-black hover:bg-[#F59E0B]/90'
                    }`}
                  >
                    {hasApproved ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Signed</span>
                      </>
                    ) : (
                      <>
                        <span>Review</span>
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onComplete={handleActionComplete}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
}
