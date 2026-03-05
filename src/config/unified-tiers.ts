/**
 * Re-export wrapper — all tier config now lives in @apex-os/vibe-payment.
 * This file exists for backward compatibility with any remaining local imports.
 */

export type { AnyTierId, LegacyTierId, PaymentTier, TierId, UnifiedTier } from '@apex-os/vibe-payment';
export {
  canUpgrade,
  getAgentSlots,
  getAILimit,
  getCommissionRate,
  getSelfRebateRate,
  getSpreadBps,
  getTierById,
  getTierByVolume,
  getTierPrice,
  PAYMENT_TIERS,
  RAAS_CONFIG,
  TIER_ORDER,
  UNIFIED_TIERS,
} from '@apex-os/vibe-payment';
