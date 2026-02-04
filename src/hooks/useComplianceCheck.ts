'use client';

/**
 * Compliance Check Hook
 *
 * Manages Terms of Service and Privacy Policy acceptance state
 */

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { needsComplianceUpdate } from '@/config/compliance';

export interface ComplianceStatus {
  needsAcceptance: boolean;
  tosVersion: string | null;
  privacyVersion: string | null;
  loading: boolean;
}

export function useComplianceCheck() {
  const [status, setStatus] = useState<ComplianceStatus>({
    needsAcceptance: false,
    tosVersion: null,
    privacyVersion: null,
    loading: true,
  });

  useEffect(() => {
    checkCompliance();
  }, []);

  const checkCompliance = async () => {
    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStatus({
          needsAcceptance: false,
          tosVersion: null,
          privacyVersion: null,
          loading: false,
        });
        return;
      }

      // Get user's compliance status
      const { data: profile } = await supabase
        .from('users')
        .select('tos_accepted_version, privacy_accepted_version')
        .eq('id', user.id)
        .single();

      const needsUpdate = needsComplianceUpdate(
        profile?.tos_accepted_version,
        profile?.privacy_accepted_version
      );

      setStatus({
        needsAcceptance: needsUpdate,
        tosVersion: profile?.tos_accepted_version || null,
        privacyVersion: profile?.privacy_accepted_version || null,
        loading: false,
      });
    } catch (error) {
      console.error('[ComplianceCheck] Error:', error);
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  const acceptTerms = async (): Promise<void> => {
    const response = await fetch('/api/v1/user/accept-terms', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to accept terms');
    }

    // Refresh status
    await checkCompliance();
  };

  return {
    ...status,
    acceptTerms,
    refresh: checkCompliance,
  };
}
