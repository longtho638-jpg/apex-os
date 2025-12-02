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

  it('should upgrade to TRADER when requirements met', async () => {
    mockSingle.mockResolvedValue({
      data: { 
        active_referrals: TIERS.TRADER.requirements.referrals, 
        monthly_volume: TIERS.TRADER.requirements.volume, 
        tier: 'FREE' 
      },
      error: null
    });

    const tier = await calculateUserTier('user-123');
    expect(tier).toBe('TRADER');
  });

  it('should upgrade to ELITE when requirements met', async () => {
    mockSingle.mockResolvedValue({
      data: { 
        active_referrals: TIERS.ELITE.requirements.referrals + 10, 
        monthly_volume: TIERS.ELITE.requirements.volume + 1000, 
        tier: 'TRADER' 
      },
      error: null
    });

    const tier = await calculateUserTier('user-123');
    expect(tier).toBe('ELITE');
  });
});
