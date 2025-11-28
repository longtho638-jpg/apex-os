import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateUserTier, TIERS } from '@/lib/viral-economics/tier-manager';

// Mock supabase
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({
    from: () => ({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle
        })
      })
    })
  })
}));

describe('Tier Manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return FREE for new users with no stats', async () => {
    mockSingle.mockResolvedValue({
      data: { active_referrals: 0, monthly_volume: 0, tier: 'FREE' },
      error: null
    });

    const tier = await calculateUserTier('user-123');
    expect(tier).toBe('FREE');
  });

  it('should upgrade to BASIC when requirements met', async () => {
    mockSingle.mockResolvedValue({
      data: { 
        active_referrals: TIERS.BASIC.requirements.referrals, 
        monthly_volume: TIERS.BASIC.requirements.volume, 
        tier: 'FREE' 
      },
      error: null
    });

    const tier = await calculateUserTier('user-123');
    expect(tier).toBe('BASIC');
  });

  it('should upgrade to APEX when requirements met', async () => {
    mockSingle.mockResolvedValue({
      data: { 
        active_referrals: TIERS.APEX.requirements.referrals + 10, 
        monthly_volume: TIERS.APEX.requirements.volume + 1000, 
        tier: 'ELITE' 
      },
      error: null
    });

    const tier = await calculateUserTier('user-123');
    expect(tier).toBe('APEX');
  });
});
