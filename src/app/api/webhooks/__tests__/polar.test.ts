import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../polar/route'; // Corrected path
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';

const { mockInsert, mockUpsert, mockUpdate, mockEq } = vi.hoisted(() => ({
    mockInsert: vi.fn(),
    mockUpsert: vi.fn(),
    mockUpdate: vi.fn(),
    mockEq: vi.fn()
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: (table: string) => {
      if (table === 'payment_transactions') return { insert: mockInsert };
      if (table === 'subscriptions') return { upsert: mockUpsert, update: mockUpdate };
      return {};
    }
  }))
}));

// Mock Polar SDK Webhooks
vi.mock('@polar-sh/sdk/webhooks', () => ({
  validateEvent: vi.fn(),
  WebhookVerificationError: class extends Error {}
}));

// Setup mocks for update chain
mockUpdate.mockReturnValue({ eq: mockEq });

describe('Polar Webhook Handler', () => {
  const secret = 'test_webhook_secret';
  
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.POLAR_WEBHOOK_SECRET = secret;
    mockInsert.mockResolvedValue({ error: null });
    mockUpsert.mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockEq.mockResolvedValue({ error: null });
  });

  it('should return 401 for invalid signature', async () => {
    // @ts-ignore
    validateEvent.mockImplementationOnce(() => {
      throw new WebhookVerificationError('Invalid signature');
    });

    const req = {
        text: vi.fn().mockResolvedValue(JSON.stringify({ type: 'test' })),
        headers: {
            get: (name: string) => {
                if (name === 'polar-webhook-signature') return 'invalid';
                if (name === 'polar-webhook-signature-timestamp') return '123';
                if (name === 'polar-webhook-id') return '1';
                if (name === 'polar-webhook-event') return 'test';
                return null;
            }
        }
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should return 400 for missing webhook headers', async () => {
    const req = {
        text: vi.fn().mockResolvedValue(JSON.stringify({ type: 'test' })),
        headers: {
            get: vi.fn().mockReturnValue(null)
        }
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should skip insert when metadata.userId missing', async () => {
    // @ts-ignore
    validateEvent.mockImplementationOnce(() => {}); // Pass validation

    const payload = {
      type: 'checkout.completed',
      data: {
        id: 'checkout_123',
        metadata: { tier: 'FOUNDERS' } // Missing userId
      }
    };

    const req = {
        text: vi.fn().mockResolvedValue(JSON.stringify(payload)),
        headers: {
            get: (name: string) => {
                if (name === 'polar-webhook-signature') return 'valid';
                if (name === 'polar-webhook-signature-timestamp') return '123';
                if (name === 'polar-webhook-id') return '1';
                if (name === 'polar-webhook-event') return 'checkout.completed';
                return null;
            }
        }
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(200); // Webhook processed successfully (logged error internally)
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('should return 500 on database error', async () => {
    // @ts-ignore
    validateEvent.mockImplementationOnce(() => {});
    mockInsert.mockResolvedValueOnce({ error: { message: 'DB Error' } });

    const payload = {
      type: 'checkout.completed',
      data: {
        id: 'checkout_123',
        amount: 4900,
        metadata: { userId: 'user_123', tier: 'FOUNDERS' }
      }
    };

    const req = {
        text: vi.fn().mockResolvedValue(JSON.stringify(payload)),
        headers: {
            get: (name: string) => {
                if (name === 'polar-webhook-signature') return 'valid';
                if (name === 'polar-webhook-signature-timestamp') return '123';
                if (name === 'polar-webhook-id') return '1';
                if (name === 'polar-webhook-event') return 'checkout.completed';
                return null;
            }
        }
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it('should handle duplicate transaction idempotently', async () => {
    // @ts-ignore
    validateEvent.mockImplementationOnce(() => {});
    mockInsert.mockResolvedValueOnce({ error: { code: '23505' } }); // Duplicate error code

    const payload = {
      type: 'checkout.completed',
      data: {
        id: 'checkout_123',
        amount: 4900,
        metadata: { userId: 'user_123', tier: 'FOUNDERS' }
      }
    };

    const req = {
        text: vi.fn().mockResolvedValue(JSON.stringify(payload)),
        headers: {
            get: (name: string) => {
                if (name === 'polar-webhook-signature') return 'valid';
                if (name === 'polar-webhook-signature-timestamp') return '123';
                if (name === 'polar-webhook-id') return '1';
                if (name === 'polar-webhook-event') return 'checkout.completed';
                return null;
            }
        }
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(200); // Should succeed (graceful duplicate handling)
  });

  it('should process checkout.completed event', async () => {
    // @ts-ignore
    validateEvent.mockImplementationOnce(() => {}); // Pass validation

    const payload = {
      type: 'checkout.completed',
      data: {
        id: 'checkout_123',
        amount: 4900,
        currency: 'USD',
        metadata: { userId: 'user_123', tier: 'FOUNDERS' }
      }
    };

    const req = {
        text: vi.fn().mockResolvedValue(JSON.stringify(payload)),
        headers: {
            get: (name: string) => {
                if (name === 'polar-webhook-signature') return 'valid';
                if (name === 'polar-webhook-signature-timestamp') return '123';
                if (name === 'polar-webhook-id') return '1';
                if (name === 'polar-webhook-event') return 'checkout.completed';
                return null;
            }
        }
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'user_123',
      gateway: 'polar',
      amount: 49, // 4900 / 100
      status: 'completed'
    }));

    expect(mockUpsert).toHaveBeenCalled();
  });
});
