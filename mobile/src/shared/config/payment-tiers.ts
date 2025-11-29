/**
 * PAYMENT TIERS - Backward Compatible Wrapper
 * 
 * This file re-exports from unified-tiers.ts for backward compatibility.
 * All new code should import from '@/config/unified-tiers' instead.
 */

export {
  PAYMENT_TIERS,
  UNIFIED_TIERS,
  getTierById,
  getTierPrice,
} from './unified-tiers';

export type { PaymentTier, TierId } from './unified-tiers';

// Re-export for legacy code that expects old structure
// UPDATED: Removed legacy mappings to force migration errors if used
export const PAYMENT_TIER_IDS = {
  FREE: 'FREE',
  PRO: 'PRO',
  TRADER: 'TRADER',
  ELITE: 'ELITE',
  PAY_PER_SIGNAL: 'PAY_PER_SIGNAL',
} as const;