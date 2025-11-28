import axios from 'axios';

interface PayoutRequest {
  address: string;
  amount: number;
  currency: string;
  withdrawal_id: string;
}

interface PayoutResponse {
  success: boolean;
  payout_id?: string;
  status?: string;
  error?: string;
}

class NOWPaymentsClient {
  private apiKey: string;
  private baseUrl: string;
  
  constructor() {
    this.apiKey = process.env.NOWPAYMENTS_API_KEY || '';
    this.baseUrl = process.env.NOWPAYMENTS_SANDBOX === 'true'
      ? 'https://api-sandbox.nowpayments.io/v1'
      : 'https://api.nowpayments.io/v1';
      
    if (!this.apiKey) {
      console.warn('NOWPayments API Key not found. Payouts will fail.');
    }
  }
  
  async createPayout(payout: PayoutRequest): Promise<PayoutResponse> {
    try {
      // In Sandbox, authentication might be optional or different for some endpoints,
      // but we assume standard flow.
      
      // AUTHENTICATION: First get a token if required, or use API Key directly.
      // NOWPayments Payout API usually requires a specific "Email-User-Pass" auth to get a token for payouts?
      // Documentation says: POST /auth to get token using email/password.
      // THEN use token for /payout.
      // API Key is for payments (receiving). Payouts might need separate auth.
      // Let's assume we use the API Key header `x-api-key` as per standard docs, 
      // BUT Payouts specifically often need a JWT token from `/auth`.
      
      // Let's implement the token flow if needed.
      // For simplicity in this MVP, we'll try API Key first. If 401, we'd implement Auth.
      // NOWPayments Payout API Docs: "Authenticate with email & password to get token"
      
      let token = '';
      if (process.env.NOWPAYMENTS_EMAIL && process.env.NOWPAYMENTS_PASSWORD) {
          const authRes = await axios.post(`${this.baseUrl}/auth`, {
              email: process.env.NOWPAYMENTS_EMAIL,
              password: process.env.NOWPAYMENTS_PASSWORD
          });
          token = authRes.data.token;
      }

      const headers: any = {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey
      };
      
      if (token) {
          headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.post(
        `${this.baseUrl}/payout`,
        {
          withdrawals: [{
            address: payout.address,
            currency: payout.currency.toLowerCase(), // 'usdttrc20'
            amount: payout.amount,
            ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nowpayments/${payout.withdrawal_id}`
          }]
        },
        { headers }
      );
      
      return {
        success: true,
        payout_id: response.data.id,
        status: response.data.status
      };
    } catch (error: any) {
      console.error('NOWPayments Payout Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
  
  async getPayoutStatus(payoutId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/payout/${payoutId}`,
        { headers: { 'x-api-key': this.apiKey } }
      );
      
      return {
        status: response.data.status, // 'FINISHED', 'PENDING', 'FAILED', 'CREATING'
        tx_hash: response.data.hash, // Might be in 'batch_withdrawals' array or root depending on version
        fee: response.data.fee
      };
    } catch (error) {
      console.error('Get Payout Status Error:', error);
      throw error;
    }
  }
}

export const nowPayments = new NOWPaymentsClient();
