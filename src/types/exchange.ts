export type Exchange = 'binance' | 'bybit' | 'okx' | 'bitget' | 'kucoin' | 'mexc' | 'gate' | 'htx' | 'bingx' | 'phemex' | 'coinex' | 'bitmart';

export const EXCHANGES: Exchange[] = [
    'binance', 'bybit', 'okx', 'bitget', 'kucoin', 'mexc',
    'gate', 'htx', 'bingx', 'phemex', 'coinex', 'bitmart'
];

export interface ExchangeFormValues {
    exchange: Exchange;
    user_uid: string;
}

export type VerificationStatus = 'verified' | 'pending' | 'failed' | 'needs_relink';

export interface LinkedAccount {
    id: string;
    user_id: string;
    exchange: string;
    user_uid: string;
    verification_status: VerificationStatus;
    linked_at: string | null;
    created_at: string;
    last_verified_at?: string;
    verification_attempts?: number;
    metadata?: {
        tier?: string;
        error_reason?: string;
        partner_uuid?: string;
        [key: string]: any;
    };
}

export interface VerificationResult {
    success?: boolean;
    verified: boolean;
    status: VerificationStatus;
    message: string;
    needs_relink?: boolean;
    referral_link?: string | null;
    metadata?: any;
}
