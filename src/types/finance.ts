export type Currency = 'USDT' | 'USDC' | 'BTC' | 'ETH';

export interface Wallet {
  id: string;
  user_id: string;
  currency: Currency;
  balance: number;
  pending_payout: number;
  is_frozen: boolean;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'rebate' | 'withdrawal' | 'withdrawal_fee' | 'adjustment' | 'bonus' | 'refund';

export interface Transaction {
  id: string;
  wallet_id: string;
  type: TransactionType;
  amount: number;
  balance_after: number;
  reference_id?: string;
  reference_type?: 'trade' | 'withdrawal' | 'manual';
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export type PaymentMethodType = 'crypto_wallet' | 'bank_transfer';

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: PaymentMethodType;
  name: string;
  details: {
    network?: string;
    address?: string;
    bank_name?: string;
    account_number?: string;
    account_holder?: string;
    swift_code?: string;
    [key: string]: unknown;
  };
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';

export interface Withdrawal {
  id: string;
  user_id: string;
  wallet_id: string;
  amount: number;
  fee: number;
  net_amount: number;
  currency: Currency;
  status: WithdrawalStatus;
  payment_method_snapshot: PaymentMethod['details'];
  tx_hash?: string;
  admin_note?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}
