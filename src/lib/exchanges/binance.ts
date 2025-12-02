import crypto from 'crypto';

interface BinanceBalance {
    asset: string;
    free: string;
    locked: string;
}

export class BinanceClient {
    private apiKey: string;
    private apiSecret: string;
    private baseUrl = 'https://api.binance.com';

    constructor(apiKey: string, apiSecret: string) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    private sign(queryString: string): string {
        return crypto
            .createHmac('sha256', this.apiSecret)
            .update(queryString)
            .digest('hex');
    }

    async getAccountBalance(): Promise<BinanceBalance[]> {
        const endpoint = '/api/v3/account';
        const timestamp = Date.now();
        const queryString = `timestamp=${timestamp}`;
        const signature = this.sign(queryString);
        
        const url = `${this.baseUrl}${endpoint}?${queryString}&signature=${signature}`;

        try {
            const res = await fetch(url, {
                headers: {
                    'X-MBX-APIKEY': this.apiKey
                }
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Binance API Error: ${res.status} ${errorText}`);
            }

            const data = await res.json();
            // Filter out zero balances to save space
            return data.balances.filter((b: any) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0);

        } catch (error) {
            console.error('Binance Balance Fetch Error:', error);
            throw error;
        }
    }
}
