import { beforeEach, describe, expect, it, vi } from 'vitest';
import { calculateUserTier, checkTierRequirements, promoteTier, TIERS } from '@/lib/viral-economics/tier-manager';

// Mock supabase
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockUpdate = vi.fn();
const mockUpdateEq = vi.fn();

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({
    from: () => ({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle,
        }),
      }),
      update: mockUpdate.mockReturnValue({
        eq: mockUpdateEq,
      }),
    }),
  }),
}));

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

describe('Tier Manager (RaaS)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return EXPLORER for new users with no stats', async () => {
    mockSingle.mockResolvedValue({
      data: { active_referrals: 0, monthly_volume: 0, tier: 'EXPLORER' },
      error: null,
    });

    const tier = await calculateUserTier('user-123');
    expect(tier).toBe('EXPLORER');
  });

  it('should upgrade to ARCHITECT when volume requirements met', async () => {
    mockSingle.mockResolvedValue({
      data: {
        active_referrals: TIERS.ARCHITECT.requirements.referrals,
        monthly_volume: TIERS.ARCHITECT.requirements.volume,
        tier: 'EXPLORER',
      },
      error: null,
    });

    const tier = await calculateUserTier('user-123');
    expect(tier).toBe('ARCHITECT');
  });

  it('should upgrade to SOVEREIGN when volume requirements met', async () => {
    mockSingle.mockResolvedValue({
      data: {
        active_referrals: TIERS.SOVEREIGN.requirements.referrals + 10,
        monthly_volume: TIERS.SOVEREIGN.requirements.volume + 1000,
        tier: 'ARCHITECT',
      },
      error: null,
    });

    const tier = await calculateUserTier('user-123');
    expect(tier).toBe('SOVEREIGN');
  });

  it('calculateUserTier returns EXPLORER on supabase error', async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error('DB error') });
    const tier = await calculateUserTier('user-err');
    expect(tier).toBe('EXPLORER');
  });

  it('calculateUserTier returns OPERATOR for matching volume/referrals', async () => {
    mockSingle.mockResolvedValue({
      data: {
        active_referrals: TIERS.OPERATOR.requirements.referrals,
        monthly_volume: TIERS.OPERATOR.requirements.volume,
        tier: 'EXPLORER',
      },
      error: null,
    });
    const tier = await calculateUserTier('user-op');
    expect(tier).toBe('OPERATOR');
  });

  describe('checkTierRequirements', () => {
    it('returns false when supabase errors', async () => {
      mockSingle.mockResolvedValue({ data: null, error: new Error('fail') });
      const result = await checkTierRequirements('user-x', 'OPERATOR');
      expect(result).toBe(false);
    });

    it('returns true when requirements are met', async () => {
      mockSingle.mockResolvedValue({
        data: {
          active_referrals: TIERS.OPERATOR.requirements.referrals,
          monthly_volume: TIERS.OPERATOR.requirements.volume,
        },
        error: null,
      });
      const result = await checkTierRequirements('user-x', 'OPERATOR');
      expect(result).toBe(true);
    });

    it('returns false when requirements are not met', async () => {
      mockSingle.mockResolvedValue({
        data: { active_referrals: 0, monthly_volume: 0 },
        error: null,
      });
      const result = await checkTierRequirements('user-x', 'SOVEREIGN');
      expect(result).toBe(false);
    });
  });

  describe('promoteTier', () => {
    it('returns false when tier has not changed', async () => {
      // calculateUserTier → EXPLORER, currentData → EXPLORER
      mockSingle.mockResolvedValue({
        data: { active_referrals: 0, monthly_volume: 0, tier: 'EXPLORER' },
        error: null,
      });
      const result = await promoteTier('user-same');
      expect(result).toBe(false);
    });

    it('returns true and updates DB on valid upgrade', async () => {
      // First call (calculateUserTier): returns OPERATOR stats
      // Second call (current tier fetch): returns EXPLORER
      mockSingle
        .mockResolvedValueOnce({
          data: {
            active_referrals: TIERS.OPERATOR.requirements.referrals,
            monthly_volume: TIERS.OPERATOR.requirements.volume,
            tier: 'EXPLORER',
          },
          error: null,
        })
        .mockResolvedValueOnce({ data: { tier: 'EXPLORER' }, error: null });
      mockUpdateEq.mockResolvedValue({ error: null });

      const result = await promoteTier('user-up');
      expect(result).toBe(true);
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('returns false on DB update error', async () => {
      mockSingle
        .mockResolvedValueOnce({
          data: {
            active_referrals: TIERS.OPERATOR.requirements.referrals,
            monthly_volume: TIERS.OPERATOR.requirements.volume,
            tier: 'EXPLORER',
          },
          error: null,
        })
        .mockResolvedValueOnce({ data: { tier: 'EXPLORER' }, error: null });
      mockUpdateEq.mockResolvedValue({ error: new Error('update failed') });

      const result = await promoteTier('user-dberr');
      expect(result).toBe(false);
    });
  });
});
