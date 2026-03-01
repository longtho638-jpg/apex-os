/**
 * Re-export wrapper — all tier config now lives in @apex-os/vibe-payment.
 * This file exists for backward compatibility with any remaining local imports.
 */
export {
  RAAS_CONFIG, UNIFIED_TIERS, PAYMENT_TIERS, TIER_ORDER,
  getTierById, getTierPrice, getCommissionRate, getSelfRebateRate,
  getSpreadBps, getAILimit, getAgentSlots, getTierByVolume, canUpgrade,
} from '@apex-os/vibe-payment';

export type {
  TierId, LegacyTierId, AnyTierId, UnifiedTier, PaymentTier,
} from '@apex-os/vibe-payment';
