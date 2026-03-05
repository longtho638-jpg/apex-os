'use client';

import { X } from 'lucide-react';
import ProviderAnalytics from './ProviderAnalytics';

interface ProviderAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string | null;
  providerName: string;
}

export default function ProviderAnalyticsModal({
  isOpen,
  onClose,
  providerId,
  providerName,
}: ProviderAnalyticsModalProps) {
  if (!isOpen || !providerId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <h2 className="text-xl font-bold text-white">Analytics: {providerName}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <ProviderAnalytics providerId={providerId} />
        </div>
      </div>
    </div>
  );
}
