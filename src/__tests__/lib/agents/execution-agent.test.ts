import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeWithdrawal } from '@/lib/agents/execution-agent';
import { nowPayments } from '@apex-os/vibe-payment';
import crypto from 'crypto';

// Mock Supabase
const mockRpc = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockUpdate = vi.fn();
const mockInsert = vi.fn();

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({
    rpc: mockRpc,
    from: mockFrom
  })
}));

vi.mock('@/lib/payments/nowpayments-client', () => ({
  nowPayments: {
    createPayout: vi.fn(),
    getPayoutStatus: vi.fn()
  }
}));

describe('Execution Agent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUPABASE_JWT_SECRET = 'test-secret';
    
    // Chain mocks
    mockFrom.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
      insert: mockInsert,
      delete: vi.fn().mockReturnValue({ eq: vi.fn() })
    });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle, eq: mockEq }); // Chainable eq
    mockUpdate.mockReturnValue({ eq: vi.fn() });
    mockInsert.mockReturnValue({});
  });

  it('should execute valid withdrawal', async () => {
    const withdrawalId = 'wd-123';
    const userId = 'user-1';
    const amount = 100;
    const address = 'TAddress123';
    const nonce = 'randomNonce';
    
    // Generate valid checksum
    const checksum = crypto
      .createHash('sha256')
      .update(`${userId}:${amount}:${address}:${nonce}:test-secret`)
      .digest('hex');
      
    // Mock Database Response
    mockSingle.mockResolvedValue({
      data: {
        id: withdrawalId,
        user_id: userId,
        amount,
        crypto_address: address,
        status: 'approved',
        data_checksum: checksum,
        agent_notes: `nonce:${nonce}`
      },
      error: null
    });
    
    // Mock NOWPayments
    // @ts-ignore
    nowPayments.createPayout.mockResolvedValue({ success: true, payout_id: 'payout-1' });
    // @ts-ignore
    nowPayments.getPayoutStatus.mockResolvedValue({ status: 'FINISHED', tx_hash: '0xHash', fee: 1 });

    const result = await executeWithdrawal(withdrawalId);

    expect(result.success).toBe(true);
    expect(result.tx_hash).toBe('0xHash');
    
    // Verify Status Update
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'executing' }));
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed', tx_hash: '0xHash' }));
    
    // Verify Finalize RPC
    expect(mockRpc).toHaveBeenCalledWith('finalize_withdrawal', {
        p_user_id: userId,
        p_amount: amount
    });
  });

  it('should fail if checksum invalid', async () => {
    // Mock Database Response with mismatching checksum
    mockSingle.mockResolvedValue({
      data: {
        id: 'wd-123',
        user_id: 'user-1',
        amount: 100,
        crypto_address: 'TAddress123',
        status: 'approved',
        data_checksum: 'invalid_checksum',
        agent_notes: `nonce:randomNonce`
      },
      error: null
    });

    const result = await executeWithdrawal('wd-123');
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Data integrity check failed');
    // Should not call NOWPayments
    expect(nowPayments.createPayout).not.toHaveBeenCalled();
  });
});
