'use client';

import { motion } from 'framer-motion';
import { CheckCircle, FileJson, Shield, X, XCircle } from 'lucide-react';
import { useState } from 'react';
import { logger } from '@/lib/logger';

interface RequestDetailModalProps {
  request: any;
  onClose: () => void;
  onComplete: () => void;
  currentUserId?: string;
}

export default function RequestDetailModal({ request, onClose, onComplete, currentUserId }: RequestDetailModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const hasApproved = request.approvals.some((a: any) => a.admin_id === currentUserId);
  const _isRequester = request.requester.email === currentUserId; // Assuming email match or ID match if available

  const handleApprove = async () => {
    if (
      !confirm('Are you sure you want to approve this request? This action is recorded on the blockchain (audit log).')
    )
      return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/admin/approvals/${request.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: currentUserId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isFullyApproved) {
          alert('Request approved successfully');
        } else {
          alert('Approval recorded. Waiting for other admins.');
        }
        onComplete();
        onClose();
      } else {
        const err = await response.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      logger.error('Operation failed', error);
      alert('Approve failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Reason is required for rejection');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/admin/approvals/${request.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: currentUserId, reason: rejectReason }),
      });

      if (response.ok) {
        alert('Request rejected');
        onComplete();
        onClose();
      } else {
        alert('Failed to reject request');
      }
    } catch (error) {
      logger.error('Operation failed', error);
      alert('Reject failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-[#F59E0B]" />
            <div>
              <h2 className="text-xl font-bold text-white">Review Request</h2>
              <p className="text-sm text-gray-400">ID: {request.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Action Type</div>
              <div className="text-lg font-bold text-white">{request.action_type}</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Requester</div>
              <div className="text-lg font-bold text-white">{request.requester.full_name}</div>
              <div className="text-xs text-gray-500">{request.requester.email}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <FileJson className="h-4 w-4" />
              <span>Payload Details</span>
            </div>
            <div className="bg-black rounded-xl p-4 border border-white/10 font-mono text-xs text-gray-300 overflow-auto max-h-60">
              <pre>{JSON.stringify(request.payload, null, 2)}</pre>
            </div>
          </div>

          {showRejectInput && (
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Reason for Rejection</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-red-500/50"
                placeholder="Why are you rejecting this request?"
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
            Cancel
          </button>

          {hasApproved ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30">
              <CheckCircle className="h-4 w-4" />
              <span>You Signed This</span>
            </div>
          ) : (
            <>
              {!showRejectInput ? (
                <button
                  onClick={() => setShowRejectInput(true)}
                  className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg border border-red-500/30 transition-colors flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject</span>
                </button>
              ) : (
                <button
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              )}

              <button
                onClick={handleApprove}
                disabled={isSubmitting || showRejectInput}
                className="px-4 py-2 bg-[#00FF94] text-black font-bold hover:bg-[#00CC76] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Approve & Sign</span>
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
