import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../polar/route';

const { mockInsert, mockRpc, mockTimingSafeEqual, mockCreateHmac } = vi.hoisted(() => ({
  mockInsert: vi.fn(),
  mockRpc: vi.fn(),
  mockTimingSafeEqual: vi.fn(),
  mockCreateHmac: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: (table: string) => {
      if (table === 'payment_transactions') return { insert: mockInsert };
      return {};
    },
    rpc: mockRpc,
  })),
}));

vi.mock('node:crypto', () => ({
  default: {
    createHmac: mockCreateHmac,
    timingSafeEqual: mockTimingSafeEqual,
  },
}));

const mockHmac = {
  update: vi.fn().mockReturnThis(),
  digest: vi.fn(),
};

describe('Polar Webhook Handler (RaaS)', () => {
  const secret = 'test_webhook_secret';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.POLAR_WEBHOOK_SECRET = secret;
    mockInsert.mockResolvedValue({ error: null });
    mockRpc.mockResolvedValue({ error: null });
    mockCreateHmac.mockReturnValue(mockHmac);
    mockHmac.digest.mockReturnValue('valid');
  });

  it('should return 401 for invalid signature', async () => {
    mockTimingSafeEqual.mockReturnValue(false);

    const req = {
      text: vi.fn().mockResolvedValue(JSON.stringify({ type: 'test' })),
      headers: {
        get: (name: string) => {
          if (name === 'polar-webhook-signature') return 'invalid';
          return null;
        },
      },
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should return 401 for missing webhook signature', async () => {
    const req = {
      text: vi.fn().mockResolvedValue(JSON.stringify({ type: 'test' })),
      headers: {
        get: vi.fn().mockReturnValue(null),
      },
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should skip processing when metadata.userId missing', async () => {
    mockTimingSafeEqual.mockReturnValue(true);

    const payload = {
      type: 'checkout.completed',
      data: {
        id: 'checkout_123',
        metadata: { type: 'deposit' },
      },
    };

    const req = {
      text: vi.fn().mockResolvedValue(JSON.stringify(payload)),
      headers: {
        get: (name: string) => {
          if (name === 'polar-webhook-signature') return 'valid';
          return null;
        },
      },
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('should return 500 on database error', async () => {
    mockTimingSafeEqual.mockReturnValue(true);
    mockInsert.mockResolvedValueOnce({ error: { message: 'DB Error' } });

    const payload = {
      type: 'checkout.completed',
      data: {
        id: 'checkout_123',
        amount: 4900,
        metadata: { userId: 'user_123', type: 'wallet_deposit' },
      },
    };

    const req = {
      text: vi.fn().mockResolvedValue(JSON.stringify(payload)),
      headers: {
        get: (name: string) => {
          if (name === 'polar-webhook-signature') return 'valid';
          return null;
        },
      },
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it('should handle duplicate transaction idempotently', async () => {
    mockTimingSafeEqual.mockReturnValue(true);
    mockInsert.mockResolvedValueOnce({ error: { code: '23505' } });

    const payload = {
      type: 'checkout.completed',
      data: {
        id: 'checkout_123',
        amount: 4900,
        metadata: { userId: 'user_123', type: 'wallet_deposit' },
      },
    };

    const req = {
      text: vi.fn().mockResolvedValue(JSON.stringify(payload)),
      headers: {
        get: (name: string) => {
          if (name === 'polar-webhook-signature') return 'valid';
          return null;
        },
      },
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('should process checkout.completed and credit wallet', async () => {
    mockTimingSafeEqual.mockReturnValue(true);

    const payload = {
      type: 'checkout.completed',
      data: {
        id: 'checkout_123',
        amount: 5000,
        currency: 'USD',
        customer_email: 'trader@example.com',
        metadata: { userId: 'user_123', type: 'wallet_deposit' },
      },
    };

    const req = {
      text: vi.fn().mockResolvedValue(JSON.stringify(payload)),
      headers: {
        get: (name: string) => {
          if (name === 'polar-webhook-signature') return 'valid';
          return null;
        },
      },
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(200);

    // Verify transaction recorded
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user_123',
        gateway: 'polar',
        amount: 50,
        status: 'completed',
        product_name: 'wallet_deposit',
      }),
    );

    // Verify wallet credited via RPC (RaaS: no subscription, direct credit)
    expect(mockRpc).toHaveBeenCalledWith(
      'credit_user_balance_realtime',
      expect.objectContaining({
        p_user_id: 'user_123',
        p_amount: 50,
        p_source: 'polar_deposit',
      }),
    );
  });
});
