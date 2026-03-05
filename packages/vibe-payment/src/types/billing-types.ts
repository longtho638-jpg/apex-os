/**
 * Shared billing & payment types for the vibe-payment package.
 * All type definitions centralized here — consumed by config, hooks, clients.
 */

// ---- Tier Types ----

export type TierId = 'EXPLORER' | 'OPERATOR' | 'ARCHITECT' | 'SOVEREIGN';
export type LegacyTierId = 'FREE' | 'PRO' | 'TRADER' | 'ELITE' | 'WHALE' | 'PAY_PER_SIGNAL';
export type AnyTierId = TierId | LegacyTierId;
export type PaymentTier = 'FREE' | 'FOUNDERS' | 'PREMIUM' | 'PAY_PER_SIGNAL';

export interface CommissionRates {
  l1: number;
  l2: number;
  l3: number;
  l4: number;
  total: number;
}

export interface UnifiedTier {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly monthlyPrice: number;
  readonly annualPrice: number;
  readonly currency: string;
  readonly volumeThreshold: number;
  readonly monthlyVolumeMax: number;
  readonly aiRequestsPerDay: number;
  readonly tradingSignalsPerMonth: number;
  readonly spreadBps: number;
  readonly selfRebateRate: number;
  readonly commissionRates: CommissionRates;
  readonly agentSlots: number;
  readonly agentTypes: readonly string[];
  readonly features: readonly string[];
  readonly highlight?: string;
  readonly polar: { productPriceId: string } | null;
  readonly nowPayments: { price_amount: number; price_currency: string; cryptoDiscount?: number } | null;
}

// ---- Billing API Types ----

export interface RaaSBillingInfo {
  current_tier: TierId;
  tier_name: string;
  monthly_volume: number;
  spread_rate: number;
  self_rebate_rate: number;
  agent_slots: number;
  volume_to_next_tier: number;
  features: string[];
  earning_history: Array<{
    date: string;
    amount: number;
    type: 'self_rebate' | 'referral_l1' | 'referral_l2' | 'referral_l3' | 'referral_l4';
    description: string;
  }>;
}

// ---- Polar Client Types ----

export interface CreateCheckoutParams {
  userId: string;
  userEmail: string;
  tier: PaymentTier | string;
}

// ---- NOWPayments Client Types ----

export interface NOWPaymentsInvoiceResponse {
  id: string;
  order_id: string;
  order_description: string;
  price_amount: string;
  price_currency: string;
  pay_currency: string | null;
  ipn_callback_url: string;
  invoice_url: string;
  success_url: string;
  cancel_url: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceParams {
  userId: string;
  tier: PaymentTier;
  amountOverride?: number;
}

export interface CreatePayoutParams {
  address: string;
  amount: number;
  currency: string;
  withdrawal_id: string;
}

export interface PayoutResult {
  success: boolean;
  payout_id?: string;
  error?: string;
}

export interface PayoutStatus {
  status: string;
  tx_hash?: string;
  fee?: number;
}

// ---- Billing API Factory Types ----

export type BillingFetcher = <T>(
  endpoint: string,
  options?: { params?: Record<string, string | number>; token?: string },
) => Promise<T>;

// ---- Hook Parameter Types ----

export interface UseSubscriptionParams {
  userId?: string;
  token?: string;
  fetchBillingInfo: (userId: string, token?: string) => Promise<RaaSBillingInfo>;
}

export interface UseUserTierParams {
  isAuthenticated: boolean;
  userId?: string;
  token?: string;
  apiBaseUrl: string;
}

export interface UseUpgradeTierParams {
  supabaseClient: {
    functions: {
      invoke: (
        name: string,
        options: { body: Record<string, unknown> },
      ) => Promise<{
        data: { success?: boolean; message?: string } | null;
        error: { message: string } | null;
      }>;
    };
  } | null;
}

export type MenuId =
  | 'overview'
  | 'trade'
  | 'copy-trading'
  | 'pnl'
  | 'wolfpack'
  | 'rebates'
  | 'risk'
  | 'referrals'
  | 'reports'
  | 'billing'
  | 'resources'
  | 'settings'
  | 'admin';

// ---- Payment Tier IDs (legacy + RaaS) ----

export const PAYMENT_TIER_IDS = {
  EXPLORER: 'EXPLORER',
  OPERATOR: 'OPERATOR',
  ARCHITECT: 'ARCHITECT',
  SOVEREIGN: 'SOVEREIGN',
  // Legacy aliases
  FREE: 'EXPLORER',
  PRO: 'OPERATOR',
  TRADER: 'ARCHITECT',
  ELITE: 'SOVEREIGN',
} as const;
