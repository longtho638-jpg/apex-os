import Bottleneck from 'bottleneck';
import axios, { AxiosError } from 'axios';

interface BinanceConfig {
  apiKey?: string;
  secretKey?: string;
  testnet?: boolean;
}

export class BinanceClient {
  private limiter: Bottleneck;
  private baseUrl: string;
  private apiKey?: string;
  
  constructor(config: BinanceConfig = {}) {
    // Binance rate limit: 1200 requests/minute = 20/second
    // We set a safe margin
    this.limiter = new Bottleneck({
      reservoir: 1200,
      reservoirRefreshAmount: 1200,
      reservoirRefreshInterval: 60 * 1000, // 1 minute
      maxConcurrent: 5,
      minTime: 50 // 50ms between requests
    });
    
    this.baseUrl = config.testnet 
      ? 'https://testnet.binance.vision/api'
      : 'https://api.binance.com/api';
      
    this.apiKey = config.apiKey;
  }
  
  async getKlines(params: {
    symbol: string;
    interval: string;
    startTime?: number;
    endTime?: number;
    limit?: number;
  }) {
    return this.limiter.schedule(() => this.executeRequest('/v3/klines', params));
  }
  
  private async executeRequest(endpoint: string, params: any, retries = 3): Promise<any> {
    try {
      const headers: any = {};
      if (this.apiKey) {
        headers['X-MBX-APIKEY'] = this.apiKey;
      }

      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        params,
        headers,
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      if (this.isRetryable(error) && retries > 0) {
        const delay = Math.pow(2, 4 - retries) * 1000; // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeRequest(endpoint, params, retries - 1);
      }
      throw this.categorizeError(error);
    }
  }
  
  private isRetryable(error: any): boolean {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 429) return true; // Rate limit
    if (axiosError.response?.status && axiosError.response.status >= 500) return true; // Server error
    if (axiosError.code === 'ECONNRESET') return true; // Network
    if (axiosError.code === 'ETIMEDOUT') return true; // Timeout
    return false;
  }
  
  private categorizeError(error: any): Error {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 429) {
      return new Error('RATE_LIMIT_EXCEEDED');
    }
    if (axiosError.response?.status === 401) {
      return new Error('AUTH_FAILED');
    }
    return new Error(`BINANCE_ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const binanceClient = new BinanceClient({
  apiKey: process.env.BINANCE_API_KEY,
  secretKey: process.env.BINANCE_SECRET,
  testnet: process.env.NODE_ENV !== 'production'
});
