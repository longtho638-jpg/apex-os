'use client';

/**
 * Cookie Consent Banner
 *
 * GDPR/ePrivacy compliant cookie consent banner
 * Uses localStorage for preference persistence
 */

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';

const CONSENT_KEY = 'apex_cookie_consent';

export type CookieConsentLevel = 'all' | 'essential' | 'none';

export interface CookieConsentBannerProps {
  onConsentChange?: (level: CookieConsentLevel) => void;
}

export function CookieConsentBanner({ onConsentChange }: CookieConsentBannerProps) {
  const t = useTranslations('compliance.cookies');
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleConsent = (level: CookieConsentLevel) => {
    localStorage.setItem(CONSENT_KEY, level);
    localStorage.setItem(`${CONSENT_KEY}_timestamp`, new Date().toISOString());
    setShowBanner(false);
    onConsentChange?.(level);

    // Apply consent immediately
    applyConsent(level);
  };

  const applyConsent = (level: CookieConsentLevel) => {
    if (level === 'essential' || level === 'none') {
      // Remove non-essential cookies
      const cookiesToRemove = ['_ga', '_gid', '_gat', '_fbp', 'fr'];
      cookiesToRemove.forEach((cookie) => {
        document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto p-4">
        {!showDetails ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('message', {
                  defaultValue:
                    'We use cookies to enhance your experience. By clicking "Accept All", you consent to our use of cookies.',
                })}
                {' '}
                <button
                  onClick={() => setShowDetails(true)}
                  className="text-blue-600 dark:text-blue-400 underline hover:no-underline"
                >
                  {t('learnMore', { defaultValue: 'Learn more' })}
                </button>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleConsent('essential')}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {t('rejectAll', { defaultValue: 'Reject All' })}
              </button>
              <button
                onClick={() => handleConsent('all')}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('acceptAll', { defaultValue: 'Accept All' })}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('detailsTitle', { defaultValue: 'Cookie Preferences' })}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {t('essentialTitle', { defaultValue: 'Essential Cookies' })}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('essentialDesc', {
                    defaultValue:
                      'Required for the website to function. Cannot be disabled.',
                  })}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {t('analyticsTitle', { defaultValue: 'Analytics Cookies' })}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('analyticsDesc', {
                    defaultValue:
                      'Help us understand how visitors interact with our website.',
                  })}
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleConsent('essential')}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {t('essentialOnly', { defaultValue: 'Essential Only' })}
              </button>
              <button
                onClick={() => handleConsent('all')}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('acceptAll', { defaultValue: 'Accept All' })}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Get current cookie consent level
 */
export function getCookieConsent(): CookieConsentLevel | null {
  if (typeof window === 'undefined') return null;
  const consent = localStorage.getItem(CONSENT_KEY);
  return consent as CookieConsentLevel | null;
}

/**
 * Check if a specific cookie type is allowed
 */
export function isCookieAllowed(type: 'essential' | 'analytics' | 'marketing'): boolean {
  if (type === 'essential') return true; // Always allowed
  const consent = getCookieConsent();
  return consent === 'all';
}
