import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BinanceClient } from '@/lib/binance/client';
import axios from 'axios';

vi.mock('axios');

describe('BinanceClient', () => {
  let client: BinanceClient;

  beforeEach(() => {
    client = new BinanceClient({ testnet: true });
    vi.clearAllMocks();
  });

  it('should make a successful request', async () => {
    (axios.get as any).mockResolvedValue({ data: [[123, '100', '105', '95', '102', '10']] });
    
    const data = await client.getKlines({ symbol: 'BTCUSDT', interval: '1m' });
    
    expect(data).toHaveLength(1);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('should retry on 429 rate limit error', async () => {
    // Mock 429 then success
    (axios.get as any)
      .mockRejectedValueOnce({
        response: { status: 429 },
        isAxiosError: true
      })
      .mockResolvedValueOnce({ data: [] });

    const data = await client.getKlines({ symbol: 'BTCUSDT', interval: '1m' });
    
    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(data).toEqual([]);
  });

  it('should retry on network timeout', async () => {
    // Mock timeout then success
    (axios.get as any)
      .mockRejectedValueOnce({
        code: 'ETIMEDOUT',
        isAxiosError: true
      })
      .mockResolvedValueOnce({ data: [] });

    const data = await client.getKlines({ symbol: 'BTCUSDT', interval: '1m' });
    
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it('should throw AUTH_FAILED on 401', async () => {
    (axios.get as any).mockRejectedValue({
      response: { status: 401 },
      isAxiosError: true
    });

    await expect(client.getKlines({ symbol: 'BTCUSDT', interval: '1m' }))
      .rejects.toThrow('AUTH_FAILED');
      
    expect(axios.get).toHaveBeenCalledTimes(1); // No retry
  });
});
