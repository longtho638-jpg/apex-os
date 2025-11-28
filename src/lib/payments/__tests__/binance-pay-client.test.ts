import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createBinancePayOrder } from '../binance-pay-client';
import crypto from 'crypto';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Binance Pay Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BINANCE_PAY_API_KEY = 'test_api_key';
    process.env.BINANCE_PAY_SECRET_KEY = 'test_secret_key';
    process.env.PAYMENT_SUCCESS_URL = 'http://localhost:3000/success';
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create a Binance Pay order successfully', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'SUCCESS',
        data: {
          checkoutUrl: 'https://pay.binance.com/checkout/123',
          prepayId: 'prepay_123'
        }
      })
    });

    const result = await createBinancePayOrder({
      userId: 'user_123',
      userEmail: 'test@example.com',
      tier: 'PREMIUM'
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://bpay.binanceapi.com/binancepay/openapi/v2/order',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'BinancePay-Certificate-SN': 'test_api_key',
          'BinancePay-Signature': expect.any(String)
        })
      })
    );

    expect(result).toEqual({
      checkoutUrl: 'https://pay.binance.com/checkout/123',
      prepayId: 'prepay_123',
      orderId: expect.stringContaining('APEX-user_123-')
    });
  });

  it('should generate correct HMAC signature', async () => {
    // Spy on crypto.createHmac to verify secret key usage
    const hmacSpy = vi.spyOn(crypto, 'createHmac');
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'SUCCESS', data: {} })
    });

    await createBinancePayOrder({
      userId: 'user_123',
      userEmail: 'test@example.com',
      tier: 'FOUNDERS'
    });

    expect(hmacSpy).toHaveBeenCalledWith('sha512', 'test_secret_key');
  });

  it('should throw error if Binance API returns failure status', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'FAIL',
        errorMessage: 'Invalid Merchant'
      })
    });

    await expect(createBinancePayOrder({
      userId: 'user_123',
      userEmail: 'test@example.com',
      tier: 'FOUNDERS'
    })).rejects.toThrow('Binance Pay order creation failed: Invalid Merchant');
  });

  it('should throw error if HTTP request fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error'
    });

    await expect(createBinancePayOrder({
      userId: 'user_123',
      userEmail: 'test@example.com',
      tier: 'FOUNDERS'
    })).rejects.toThrow('Binance Pay API error: Internal Server Error');
  });
});
