'use client';

/**
 * Terms of Service / Privacy Policy Acceptance Modal
 *
 * Forces users to accept updated terms before accessing the platform
 */

import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { COMPLIANCE_CONFIG } from '@/config/compliance';

export interface TermsModalProps {
  isOpen: boolean;
  onAccept: () => Promise<void>;
  userEmail?: string;
}

export function TermsModal({ isOpen, onAccept, userEmail }: TermsModalProps) {
  const t = useTranslations('compliance.terms');
  const [tosChecked, setTosChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!tosChecked || !privacyChecked) {
      setError(t('errorCheckboxes', { defaultValue: 'Please accept both agreements' }));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onAccept();
    } catch (_err) {
      setError(
        t('errorGeneric', {
          defaultValue: 'Failed to save acceptance. Please try again.',
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('title', { defaultValue: 'Updated Terms and Privacy Policy' })}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('subtitle', {
                  defaultValue: 'We have updated our terms. Please review and accept to continue.',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* User Info */}
          {userEmail && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <span className="font-medium">Account:</span> {userEmail}
              </p>
            </div>
          )}

          {/* Terms of Service */}
          <div className="space-y-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={tosChecked}
                onChange={(e) => setTosChecked(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                {t('tosLabel', {
                  defaultValue: 'I accept the',
                })}{' '}
                <a
                  href={COMPLIANCE_CONFIG.tos.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 underline hover:no-underline font-medium"
                >
                  {t('tosLink', { defaultValue: 'Terms of Service' })}
                </a>{' '}
                <span className="text-gray-500 dark:text-gray-400">(v{COMPLIANCE_CONFIG.tos.version})</span>
              </span>
            </label>
          </div>

          {/* Privacy Policy */}
          <div className="space-y-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={privacyChecked}
                onChange={(e) => setPrivacyChecked(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                {t('privacyLabel', {
                  defaultValue: 'I accept the',
                })}{' '}
                <a
                  href={COMPLIANCE_CONFIG.privacy.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 underline hover:no-underline font-medium"
                >
                  {t('privacyLink', { defaultValue: 'Privacy Policy' })}
                </a>{' '}
                <span className="text-gray-500 dark:text-gray-400">(v{COMPLIANCE_CONFIG.privacy.version})</span>
              </span>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
            </div>
          )}

          {/* Important Notice */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t('notice', {
                defaultValue:
                  'By accepting, you acknowledge that you have read and understood our terms. You can withdraw consent at any time from your account settings.',
              })}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleAccept}
            disabled={!tosChecked || !privacyChecked || loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
          >
            {loading
              ? t('accepting', { defaultValue: 'Accepting...' })
              : t('acceptButton', { defaultValue: 'Accept and Continue' })}
          </button>
        </div>
      </div>
    </div>
  );
}
