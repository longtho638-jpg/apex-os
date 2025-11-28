import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processTradeCommission } from '@/lib/viral-economics/realtime-commission';
import { getSupabaseClient } from '@/lib/supabase';

// Mock Supabase
const mockRpc = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockLte = vi.fn();
const mockSingle = vi.fn();

// IMPORTANT: When mocking a module that exports a function used by the system under test,
// ensure the mock factory returns a Mock function if you intend to change its implementation later.
// Or better, use a mutable mock object pattern.

let mockSupabaseClient: any;

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: vi.fn(() => mockSupabaseClient)
}));

describe('Realtime Commission System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default chain mocks
    mockFrom.mockReturnValue({
      select: mockSelect,
      update: vi.fn().mockReturnValue({ eq: vi.fn() })
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
      lte: mockLte,
      single: mockSingle
    });
    mockEq.mockReturnValue({
      single: mockSingle,
      lte: mockLte // for chain
    });
    mockLte.mockReturnValue({
      // return data promise
      then: (cb: any) => cb({ data: [] }) // Default empty referrers
    });
    mockRpc.mockResolvedValue({ error: null });

    // Default client
    mockSupabaseClient = {
        rpc: mockRpc,
        from: mockFrom
    };
  });

  it('should credit self-rebate for FREE user', async () => {
    // Mock User Tier
    mockSingle.mockResolvedValueOnce({ data: { tier: 'FREE' } }); // user_tiers query
    
    await processTradeCommission({
      user_id: 'user-1',
      volume: 10000,
      fee: 10,
      exchange: 'Binance',
      symbol: 'BTC/USDT'
    });

    // FREE tier rebate is 0.60 (60% of revenue)
    // Revenue = 10000 * 0.0008 = 8
    // Rebate = 8 * 0.60 = 4.8
    
    expect(mockRpc).toHaveBeenCalledWith('credit_user_balance_realtime', expect.objectContaining({
      p_user_id: 'user-1',
      p_amount: 4.8,
      p_source: 'trading_rebate'
    }));
  });

  it('should credit referrer commission', async () => {
    // Redefine mocks for this specific test flow
    // We need to handle different queries for user_tiers (user vs referrer) and referral_network
    
    const customMockFrom = vi.fn((table: string) => {
        if (table === 'user_tiers') {
          return {
            select: () => ({
              eq: (col: string, val: string) => ({
                single: async () => {
                  if (val === 'user-1') return { data: { tier: 'FREE' } }; // User
                  if (val === 'ref-1') return { data: { tier: 'TRADER', current_commission_rate: 0.20 } }; // Referrer
                  return { data: null };
                }
              })
            })
          };
        }
        if (table === 'referral_network') {
          return {
            select: () => ({
              eq: () => ({
                lte: async () => ({ data: [{ referrer_id: 'ref-1', level: 1 }] })
              })
            })
          };
        }
        return { select: () => ({ eq: () => ({ single: async () => ({}) }) }), update: () => ({ eq: () => ({}) }) }; // Fallback
    });

    // Update the client used by the module
    mockSupabaseClient.from = customMockFrom;

    await processTradeCommission({
      user_id: 'user-1',
      volume: 10000,
      fee: 10,
      exchange: 'Binance',
      symbol: 'BTC/USDT'
    });

    // Revenue = 8
    // User Rebate (FREE 0.6) = 4.8
    // Remainder = 8 * (1 - 0.6) = 3.2
    
    // Referrer (TRADER 0.20) at L1 (1.0 mult)
    // Commission = 3.2 * 0.20 * 1.0 = 0.64
    
    expect(mockRpc).toHaveBeenCalledTimes(3); // Self rebate + 1 referrer + volume update
    expect(mockRpc).toHaveBeenNthCalledWith(2, 'credit_user_balance_realtime', expect.objectContaining({
      p_user_id: 'ref-1',
      p_amount: expect.closeTo(0.64),
      p_source: 'l1_commission'
    }));
  });
});