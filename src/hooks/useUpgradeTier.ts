"use client";

/**
 * Thin wrapper — injects Supabase client into vibe-payment parameterized hook.
 */
import { getSupabaseClientSide } from '@/lib/supabase';
import { useUpgradeTier as useBillingUpgradeTier } from '@apex-os/vibe-payment';

let supabase: ReturnType<typeof getSupabaseClientSide> | null = null;
if (typeof window !== 'undefined') {
  supabase = getSupabaseClientSide();
}

export function useUpgradeTier() {
  return useBillingUpgradeTier({ supabaseClient: supabase });
}
