import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../binance-pay/route'; // Corrected path
import { NextRequest } from 'next/server';
import crypto from 'crypto';

const { mockInsert, mockUpsert } = vi.hoisted(() => ({
    mockInsert: vi.fn(),
    mockUpsert: vi.fn()
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: (table: string) => {
      if (table === 'payment_transactions') return { insert: mockInsert };
      if (table === 'subscriptions') return { upsert: mockUpsert };
      return {};
    }
  }))
}));

describe('Binance Pay Webhook Handler', () => {
  const secret = 'test_webhook_secret';
  
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BINANCE_PAY_WEBHOOK_SECRET = secret;
    mockInsert.mockResolvedValue({ error: null });
    mockUpsert.mockResolvedValue({ error: null });
  });

  function generateSignature(body: string) {
    return crypto
      .createHmac('sha512', secret)
      .update(body)
      .digest('hex')
      .toUpperCase();
  }

  it('should return 401 for invalid signature', async () => {
    const req = {
        text: vi.fn().mockResolvedValue(JSON.stringify({})),
        headers: {
            get: (name: string) => {
                if (name === 'binancepay-signature') return 'invalid_signature';
                return null;
            }
        }
    } as unknown as NextRequest;

    const res = await POST(req);
    const json = await res.json();
    
    expect(res.status).toBe(401);
    expect(json.returnCode).toBe('FAIL');
  });

  it('should return 401 if signature header is missing', async () => {
    const req = {
        text: () => Promise.resolve(JSON.stringify({})),
        headers: {
            get: vi.fn().mockReturnValue(null)
        }
    } as unknown as NextRequest;

    const res = await POST(req);
    const json = await res.json();
    
    expect(res.status).toBe(401);
    expect(json.returnMessage).toBe('Invalid signature');
  });

  it('should handle duplicate transaction idempotently', async () => {
    mockInsert.mockResolvedValueOnce({ error: { code: '23505' } }); // Duplicate error

    const eventData = {
      merchantTradeNo: 'APEX-user_123-123456789',
      totalFee: '49.00',
      currency: 'USDT',
      transactionId: 'trans_123'
    };

    const payloadObj = {
        bizType: 'PAY',
        bizStatus: 'PAY_SUCCESS',
        data: JSON.stringify(eventData)
    };

    const body = JSON.stringify(payloadObj);
    const signature = generateSignature(body);

    const req = {
        text: () => Promise.resolve(body),
        headers: {
            get: (name: string) => {
                if (name === 'binancepay-signature') return signature;
                return null;
            }
        }
    } as unknown as NextRequest;

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.returnCode).toBe('SUCCESS');
  });

  it('should process PAY_SUCCESS event', async () => {
    const eventData = {
      merchantTradeNo: 'APEX-user_123-123456789',
      totalFee: '49.00',
      currency: 'USDT',
      transactionId: 'trans_123'
    };

    const payload = {
      bizType: 'PAY',
      bizStatus: 'PAY_SUCCESS',
      data: JSON.stringify(eventData) // Binance sends data as string in some contexts, but our code expects parsed object if we parse the whole body.
      // Let's check route logic: `const event = JSON.parse(body);` then `event.data`.
      // If `event.data` is used directly in `handlePaymentSuccess`, we need to ensure it matches.
      // Route logic: `const { merchantTradeNo... } = event.data;` 
      // So event.data should be an object.
    };
    
    // Update payload to match route expectation
    const payloadObj = {
        bizType: 'PAY',
        bizStatus: 'PAY_SUCCESS',
        data: JSON.stringify(eventData) // Binance sends data as a JSON string
    };

    const body = JSON.stringify(payloadObj);
    const signature = generateSignature(body);

    const req = {
        text: () => Promise.resolve(body),
        json: () => Promise.resolve(payloadObj),
        headers: {
            get: (name: string) => {
                if (name === 'binancepay-signature') return signature;
                return null;
            }
        }
    } as unknown as NextRequest;

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.returnCode).toBe('SUCCESS');

    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'user_123',
      gateway: 'binance_pay',
      amount: 49.00,
      status: 'completed'
    }));

    expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
            user_id: 'user_123',
            status: 'active',
            gateway: 'binance_pay'
        }),
        { onConflict: 'user_id' }
    );
  });

  it('should handle database errors gracefully', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'DB Error' } });

    const payloadObj = {
        bizType: 'PAY',
        bizStatus: 'PAY_SUCCESS',
        data: JSON.stringify({ merchantTradeNo: 'APEX-user_123-1', totalFee: '10', currency: 'USD' })
    };
    const body = JSON.stringify(payloadObj);
    const signature = generateSignature(body);

    const req = {
        text: () => Promise.resolve(body),
        json: () => Promise.resolve(payloadObj),
        headers: {
            get: (name: string) => {
                if (name === 'binancepay-signature') return signature;
                return null;
            }
        }
    } as unknown as NextRequest;

    // The route throws on DB error (unless duplicate), so it should catch and return 500
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.returnCode).toBe('FAIL');
  });
});
