'use client';

import { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    providerName: string;
    providerCode: string;
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    providerName,
    providerCode
}: DeleteConfirmationModalProps) {
    const [loading, setLoading] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const handleConfirm = async () => {
        if (confirmText !== providerCode) {
            return;
        }

        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error('Delete failed:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isConfirmValid = confirmText === providerCode;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900 border border-red-500/30 rounded-xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-red-500/20 bg-gradient-to-r from-red-600/20 to-orange-600/20">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                        <h2 className="text-xl font-bold text-white">Delete Provider</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 text-sm font-medium mb-2">⚠️ Warning: This action cannot be undone</p>
                        <p className="text-gray-300 text-sm">
                            You are about to delete provider <strong className="text-white">{providerName}</strong> ({providerCode}).
                            This will:
                        </p>
                        <ul className="mt-2 text-gray-400 text-sm list-disc list-inside space-y-1">
                            <li>Set status to <code className="bg-white/10 px-1 rounded">deprecated</code></li>
                            <li>Set <code className="bg-white/10 px-1 rounded">is_active = false</code></li>
                            <li>Keep historical data (soft delete)</li>
                            <li>Trigger audit log entry</li>
                        </ul>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Type <code className="bg-white/10 px-2 py-1 rounded text-red-400">{providerCode}</code> to confirm:
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                            placeholder={`Enter ${providerCode}`}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-gray-900/50">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading || !isConfirmValid}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Delete Provider
                    </button>
                </div>
            </div>
        </div>
    );
}
