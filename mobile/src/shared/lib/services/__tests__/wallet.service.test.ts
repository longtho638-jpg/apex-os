
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WalletService } from '@/lib/services/wallet.service';
import { createClient } from '@supabase/supabase-js';
import { eventBus } from '@/lib/agent/event-bus';

const { mockFrom, mockRpc } = vi.hoisted(() => ({
    mockFrom: vi.fn(),
    mockRpc: vi.fn(),
}));

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        from: mockFrom,
        rpc: mockRpc,
    })),
}));

// Mock Event Bus
vi.mock('@/lib/agent/event-bus', () => ({
    eventBus: {
        publish: vi.fn().mockResolvedValue('event-id-123'),
    }
}));

describe('WalletService - Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getWallet', () => {
        it('should return existing wallet', async () => {
            const mockWallet = {
                id: 'wallet-123',
                user_id: 'user-123',
                currency: 'USDT',
                balance: 100.50,
                pending_payout: 0,
                is_frozen: false,
            };

            mockFrom.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: mockWallet, error: null }),
                        }),
                    }),
                }),
            });

            const result = await WalletService.getWallet('user-123');
            expect(result).toEqual(mockWallet);
        });

        it('should create wallet if not exists (PGRST116 error)', async () => {
            const newWallet = {
                id: 'wallet-new',
                user_id: 'user-new',
                currency: 'USDT',
                balance: 0,
                pending_payout: 0,
                is_frozen: false,
            };

            mockFrom.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: null,
                                error: { code: 'PGRST116' }
                            }),
                        }),
                    }),
                }),
            }).mockReturnValueOnce({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: newWallet, error: null }),
                    }),
                }),
            });

            const result = await WalletService.getWallet('user-new');
            expect(result).toEqual(newWallet);
        });

        it('should throw error on database failure', async () => {
            mockFrom.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: null,
                                error: { message: 'Database error' }
                            }),
                        }),
                    }),
                }),
            });

            await expect(WalletService.getWallet('user-123')).rejects.toThrow();
        });
    });

    describe('requestWithdrawal', () => {
        it('should validate minimum amount', async () => {
            await expect(
                WalletService.requestWithdrawal('user-123', 5, 'pm-123')
            ).rejects.toThrow();
        });

        it('should create withdrawal request successfully', async () => {
            const mockPaymentMethod = {
                id: 'pm-123',
                details: { address: '0x123', network: 'TRC20' },
            };

            const mockWallet = {
                id: 'wallet-123',
                balance: 100,
            };

            const mockWithdrawal = {
                id: 'withdrawal-123',
                amount: 50,
                status: 'pending',
            };

            mockFrom.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: mockPaymentMethod, error: null }),
                        }),
                    }),
                }),
            }).mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: mockWallet, error: null }),
                        }),
                    }),
                }),
            }).mockReturnValueOnce({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: mockWithdrawal, error: null }),
                    }),
                }),
            });

            const result = await WalletService.requestWithdrawal('user-123', 50, 'pm-123');
            expect(result.status).toBe('pending');
            expect(result.amount).toBe(50);
        });
    });

    describe('getTransactions', () => {
        it('should return paginated transactions', async () => {
            const mockTransactions = [
                { id: 'tx-1', type: 'rebate', amount: 10 },
                { id: 'tx-2', type: 'withdrawal', amount: -50 },
            ];

            mockFrom.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue({
                            range: vi.fn().mockResolvedValue({ data: mockTransactions, error: null }),
                        }),
                    }),
                }),
            });

            const result = await WalletService.getTransactions('user-123', 'wallet-123');
            expect(result).toHaveLength(2);
            expect(result[0].type).toBe('rebate');
        });

        it('should return empty array if no transactions', async () => {
            mockFrom.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue({
                            range: vi.fn().mockResolvedValue({ data: null, error: null }),
                        }),
                    }),
                }),
            });

            const result = await WalletService.getTransactions('user-123', 'wallet-123');
            expect(result).toEqual([]);
        });
    });
});
