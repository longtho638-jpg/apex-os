/**
 * @apex-os/vibe-payment — Standalone payment & billing module.
 * RaaS AGI model: zero subscription, volume-based tiers, crypto + Polar gateways.
 */

// ---- Types ----
export type {
  TierId, LegacyTierId, AnyTierId, UnifiedTier, PaymentTier, CommissionRates,
  RaaSBillingInfo, CreateCheckoutParams,
  NOWPaymentsInvoiceResponse, CreateInvoiceParams, CreatePayoutParams, PayoutResult, PayoutStatus,
  BillingFetcher, UseSubscriptionParams, UseUserTierParams, UseUpgradeTierParams, MenuId,
} from './types/billing-types';
export { PAYMENT_TIER_IDS } from './types/billing-types';

// ---- Config ----
export {
  RAAS_CONFIG, UNIFIED_TIERS, PAYMENT_TIERS, TIER_ORDER,
  getTierById, getTierPrice, getCommissionRate, getSelfRebateRate,
  getSpreadBps, getAILimit, getAgentSlots, getTierByVolume, canUpgrade,
} from './config/unified-tiers';

// ---- Hooks (parameterized — app injects auth deps) ----
export { useSubscription } from './hooks/use-subscription';
export { useUserTier, normalizeTier } from './hooks/use-user-tier';
export { useUpgradeTier } from './hooks/use-upgrade-tier';

// ---- Payment Clients (server-side) ----
export { createPolarCheckout, getPolarCheckout, polarClient } from './clients/polar-client';
export { createNOWPaymentsInvoice, nowPayments } from './clients/nowpayments-client';

// ---- Billing API Factory ----
export { createBillingApi } from './api/billing-api';
