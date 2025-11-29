import { createHmac } from 'crypto';

interface BinanceConfig {
    apiKey: string;
    apiSecret: string;
    baseUrl?: string;
}

export class BinanceClient {
    private apiKey: string;
    private apiSecret: string;
    private baseUrl: string;

    constructor(config: BinanceConfig) {
        this.apiKey = config.apiKey;
        this.apiSecret = config.apiSecret;
        this.baseUrl = config.baseUrl || 'https://api.binance.com';
    }

    private generateSignature(queryString: string): string {
        return createHmac('sha256', this.apiSecret)
            .update(queryString)
            .digest('hex');
    }

    private async request(endpoint: string, method: 'GET' | 'POST' | 'DELETE' = 'GET', params: Record<string, any> = {}, signed: boolean = false) {
        let queryString = new URLSearchParams(params).toString();

        if (signed) {
            const timestamp = Date.now();
            queryString += `&timestamp=${timestamp}`;
            const signature = this.generateSignature(queryString);
            queryString += `&signature=${signature}`;
        }

        const url = `${this.baseUrl}${endpoint}?${queryString}`;
        const headers: HeadersInit = {
            'X-MBX-APIKEY': this.apiKey,
            'Content-Type': 'application/json',
        };

        const response = await fetch(url, {
            method,
            headers,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Binance API Error: ${JSON.stringify(error)}`);
        }

        return response.json();
    }

    // Public Endpoints
    async getExchangeInfo() {
        return this.request('/api/v3/exchangeInfo');
    }

    async getKlines(symbol: string, interval: string, limit: number = 500) {
        return this.request('/api/v3/klines', 'GET', { symbol, interval, limit });
    }

    async getTickerPrice(symbol: string) {
        return this.request('/api/v3/ticker/price', 'GET', { symbol });
    }

    // Private Endpoints (Trading)
    async getAccountInfo() {
        return this.request('/api/v3/account', 'GET', {}, true);
    }

    async createOrder(symbol: string, side: 'BUY' | 'SELL', type: 'LIMIT' | 'MARKET', quantity: number, price?: number) {
        const params: any = { symbol, side, type, quantity };
        if (price) params.price = price;
        if (type === 'LIMIT') params.timeInForce = 'GTC';
        return this.request('/api/v3/order', 'POST', params, true);
    }
}
