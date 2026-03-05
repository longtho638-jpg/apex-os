import { beforeEach, describe, expect, it, vi } from 'vitest';
import { processTradeCommission } from '@/lib/viral-economics/realtime-commission';

// Mock logger to prevent console output
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// Mock Supabase
const mockRpc = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockLte = vi.fn();
const mockSingle = vi.fn();

let mockSupabaseClient: ReturnType<typeof createMockClient>;

function createMockClient() {
  return { rpc: mockRpc, from: mockFrom };
}

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: vi.fn(() => mockSupabaseClient),
}));

describe('Realtime Commission System', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockReturnValue({
      select: mockSelect,
      update: vi.fn().mockReturnValue({ eq: vi.fn() }),
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
      lte: mockLte,
      single: mockSingle,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
      lte: mockLte,
    });
    mockLte.mockReturnValue({
      then: (cb: (v: { data: unknown[] }) => void) => cb({ data: [] }),
    });
    mockRpc.mockResolvedValue({ error: null });

    mockSupabaseClient = createMockClient();
  });

  it('should credit self-rebate for EXPLORER user', async () => {
    // RaaS: EXPLORER tier (was FREE) — rebate = 0.10 (10%)
    mockSingle.mockResolvedValueOnce({ data: { tier: 'EXPLORER' } });

    await processTradeCommission({
      user_id: 'user-1',
      volume: 10000,
      fee: 10,
      exchange: 'Binance',
      symbol: 'BTC/USDT',
    });

    // EXPLORER tier rebate is 0.10 (10% of revenue)
    // Revenue = 10 (fee) * 0.4 (partner share) = 4
    // Rebate = 4 * 0.10 = 0.4

    expect(mockRpc).toHaveBeenCalledWith(
      'credit_user_balance_realtime',
      expect.objectContaining({
        p_user_id: 'user-1',
        p_amount: expect.closeTo(0.4, 5),
        p_source: 'trading_rebate',
      }),
    );
  });

  it('should credit referrer commission', async () => {
    // RaaS: EXPLORER user, ARCHITECT referrer (was TRADER)
    const customMockFrom = vi.fn((table: string) => {
      if (table === 'user_tiers') {
        return {
          select: () => ({
            eq: (_col: string, val: string) => ({
              single: async () => {
                if (val === 'user-1') return { data: { tier: 'EXPLORER' } };
                if (val === 'ref-1') return { data: { tier: 'ARCHITECT' } };
                return { data: null };
              },
            }),
          }),
        };
      }
      if (table === 'referral_network') {
        return {
          select: () => ({
            eq: () => ({
              lte: async () => ({ data: [{ referrer_id: 'ref-1', level: 1 }] }),
            }),
          }),
        };
      }
      return { select: () => ({ eq: () => ({ single: async () => ({}) }) }), update: () => ({ eq: () => ({}) }) };
    });

    mockSupabaseClient.from = customMockFrom;

    await processTradeCommission({
      user_id: 'user-1',
      volume: 10000,
      fee: 10,
      exchange: 'Binance',
      symbol: 'BTC/USDT',
    });

    // Revenue = 4
    // User Rebate (EXPLORER 0.10) = 0.4
    // Referrer (ARCHITECT L1 = 0.25) commission = 4 * 0.25 = 1.0

    expect(mockRpc).toHaveBeenCalledTimes(3); // Self rebate + 1 referrer + volume update
    expect(mockRpc).toHaveBeenNthCalledWith(
      2,
      'credit_user_balance_realtime',
      expect.objectContaining({
        p_user_id: 'ref-1',
        p_amount: expect.closeTo(1.0, 5),
        p_source: 'l1_commission',
      }),
    );
  });
});
