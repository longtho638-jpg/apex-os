import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPolarCheckout } from '../polar-client';
import { PAYMENT_TIERS } from '@/config/payment-tiers';

const { mockCreate, mockGet } = vi.hoisted(() => ({
    mockCreate: vi.fn(),
    mockGet: vi.fn()
}));

vi.mock('@polar-sh/sdk', () => {
  const PolarMock = vi.fn();
  PolarMock.prototype.checkouts = {
    create: mockCreate,
    get: mockGet
  };
  return { Polar: PolarMock };
});

describe('Polar Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.POLAR_ACCESS_TOKEN = 'polar_sk_test';
    process.env.PAYMENT_SUCCESS_URL = 'http://localhost:3000/success';
  });

  it('should create a checkout session successfully', async () => {
    mockCreate.mockResolvedValue({
      id: 'checkout_123',
      url: 'https://polar.sh/checkout/123'
    });

    const result = await createPolarCheckout({
      userId: 'user_123',
      userEmail: 'test@example.com',
      tier: 'PRO'
    });

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      product_price_id: expect.any(String),
      customer_email: 'test@example.com',
      metadata: expect.objectContaining({
        userId: 'user_123',
        tier: 'PRO'
      })
    }));

    expect(result).toEqual({
      id: 'checkout_123',
      url: 'https://polar.sh/checkout/123'
    });
  });

  it('should throw error for invalid tier', async () => {
    // @ts-ignore - testing invalid input
    await expect(createPolarCheckout({
      userId: 'user_123',
      userEmail: 'test@example.com',
      tier: 'INVALID_TIER' as any
    })).rejects.toThrow(); // undefined tier config
  });

  it('should throw error if tier does not support Polar', async () => {
    await expect(createPolarCheckout({
      userId: 'user_123',
      userEmail: 'test@example.com',
      tier: 'FREE' // Free tier has polar: null
    })).rejects.toThrow('Tier FREE does not support Polar payments');
  });

  it('should handle API errors gracefully', async () => {
    mockCreate.mockRejectedValue(new Error('API Error'));

    await expect(createPolarCheckout({
      userId: 'user_123',
      userEmail: 'test@example.com',
      tier: 'PRO'
    })).rejects.toThrow('API Error');
  });
});
