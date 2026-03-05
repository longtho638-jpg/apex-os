/**
 * @apex-os/vibe-payment — Standalone payment & billing module.
 * RaaS AGI model: zero subscription, volume-based tiers, crypto + Polar gateways.
 */

// ---- Billing API Factory ----
export { createBillingApi } from './api/billing-api';
export { createNOWPaymentsInvoice, nowPayments } from './clients/nowpayments-client';
// ---- Payment Clients (server-side) ----
export { createPolarCheckout, getPolarCheckout, polarClient } from './clients/polar-client';
// ---- Config ----
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
} from './config/unified-tiers';
// ---- Hooks (parameterized — app injects auth deps) ----
export { useSubscription } from './hooks/use-subscription';
export { useUpgradeTier } from './hooks/use-upgrade-tier';
export { normalizeTier, useUserTier } from './hooks/use-user-tier';
// ---- Types ----
export type {
  AnyTierId,
  BillingFetcher,
  CommissionRates,
  CreateCheckoutParams,
  CreateInvoiceParams,
  CreatePayoutParams,
  LegacyTierId,
  MenuId,
  NOWPaymentsInvoiceResponse,
  PaymentTier,
  PayoutResult,
  PayoutStatus,
  RaaSBillingInfo,
  TierId,
  UnifiedTier,
  UseSubscriptionParams,
  UseUpgradeTierParams,
  UseUserTierParams,
} from './types/billing-types';
export { PAYMENT_TIER_IDS } from './types/billing-types';
