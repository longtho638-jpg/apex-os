/**
 * Compliance Configuration
 *
 * Centralized configuration for ToS, Privacy Policy, and Cookie Consent
 */

export const CURRENT_TOS_VERSION = '1.0';
export const CURRENT_PRIVACY_VERSION = '1.0';

export const COMPLIANCE_CONFIG = {
  tos: {
    version: CURRENT_TOS_VERSION,
    effectiveDate: '2026-02-04',
    url: '/legal/terms-of-service',
  },
  privacy: {
    version: CURRENT_PRIVACY_VERSION,
    effectiveDate: '2026-02-04',
    url: '/legal/privacy-policy',
  },
  cookies: {
    essential: ['apex_session', 'sb-access-token', 'csrf-token'],
    analytics: ['_ga', '_gid', '_gat'],
    marketing: ['_fbp', 'fr'],
  },
} as const;

/**
 * Check if user needs to accept updated ToS/Privacy
 */
export function needsComplianceUpdate(
  tosVersion?: string | null,
  privacyVersion?: string | null
): boolean {
  return (
    tosVersion !== CURRENT_TOS_VERSION ||
    privacyVersion !== CURRENT_PRIVACY_VERSION
  );
}
