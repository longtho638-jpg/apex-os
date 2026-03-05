import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPolarCheckout } from '../polar-client';

const { mockCreate, mockGet } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockGet: vi.fn(),
}));

vi.mock('@polar-sh/sdk', () => {
  const PolarMock = vi.fn();
  PolarMock.prototype.checkouts = {
    create: mockCreate,
    get: mockGet,
  };
  return { Polar: PolarMock };
});

describe('Polar Client (RaaS)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.POLAR_ACCESS_TOKEN = 'polar_sk_test';
    process.env.PAYMENT_SUCCESS_URL = 'http://localhost:3000/success';
  });

  it('should throw error for invalid tier', async () => {
    await expect(
      createPolarCheckout({
        userId: 'user_123',
        userEmail: 'test@example.com',
        tier: 'INVALID_TIER' as string,
      }),
    ).rejects.toThrow();
  });

  it('should throw error for EXPLORER tier (no Polar in RaaS zero-fee model)', async () => {
    // RaaS: All tiers have polar: null — zero-fee volume-based model
    await expect(
      createPolarCheckout({
        userId: 'user_123',
        userEmail: 'test@example.com',
        tier: 'EXPLORER',
      }),
    ).rejects.toThrow('does not support Polar payments');
  });

  it('should throw error for OPERATOR tier (no Polar in RaaS zero-fee model)', async () => {
    // RaaS: OPERATOR (was PRO) also has polar: null
    await expect(
      createPolarCheckout({
        userId: 'user_123',
        userEmail: 'test@example.com',
        tier: 'OPERATOR',
      }),
    ).rejects.toThrow('does not support Polar payments');
  });

  it('should handle legacy tier names via mapping', async () => {
    // Legacy FREE maps to EXPLORER, which has polar: null
    await expect(
      createPolarCheckout({
        userId: 'user_123',
        userEmail: 'test@example.com',
        tier: 'FREE',
      }),
    ).rejects.toThrow('does not support Polar payments');
  });
});
