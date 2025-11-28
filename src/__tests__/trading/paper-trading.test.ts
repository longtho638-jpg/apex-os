import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaperTradingEngine } from '@/lib/trading/paper-trading';

// Hoist mocks to avoid ReferenceError
const mocks = vi.hoisted(() => {
    return {
        from: vi.fn(),
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        eq: vi.fn(),
        single: vi.fn(),
    };
});

vi.mock('@supabase/supabase-js', () => ({
    createClient: () => ({
        from: mocks.from
    })
}));

describe('Paper Trading Engine', () => {
    let engine: PaperTradingEngine;

    beforeEach(() => {
        vi.clearAllMocks();
        engine = new PaperTradingEngine();
        
        // Chain mocks
        const queryBuilder = {
            select: mocks.select,
            insert: mocks.insert,
            update: mocks.update,
            delete: mocks.delete,
            eq: mocks.eq,
            single: mocks.single
        };

        mocks.from.mockReturnValue(queryBuilder);
        mocks.select.mockReturnValue(queryBuilder);
        mocks.insert.mockReturnValue(queryBuilder);
        mocks.update.mockReturnValue(queryBuilder);
        mocks.delete.mockReturnValue(queryBuilder);
        mocks.eq.mockReturnValue(queryBuilder); 
        
        mocks.single.mockResolvedValue({ data: null, error: null });
    });

    it('should create a wallet if none exists', async () => {
        mocks.single.mockResolvedValueOnce({ data: { id: 'wallet-1', balance_usdt: 100000 }, error: null });
        
        const wallet = await engine.createWallet('user-1');
        expect(wallet).toBeDefined();
        expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user-1' }));
    });

    it('should execute a BUY order', async () => {
        // Mock Wallet
        mocks.single
            .mockResolvedValueOnce({ data: { id: 'wallet-1', balance_usdt: 100000 }, error: null }) // getWallet
            .mockResolvedValueOnce({ data: null, error: null }) // getPosition (none)
            .mockResolvedValueOnce({ data: { id: 'trade-1' }, error: null }); // insert trade

        const result = await engine.executeTrade('user-1', 'BTC/USDT', 'BUY', 1, 50000);
        
        expect(mocks.update).toHaveBeenCalled(); // Balance update
        expect(mocks.insert).toHaveBeenCalled(); // Position create & Trade record
    });

    it('should reject BUY if insufficient funds', async () => {
        // Mock Wallet with low balance
        mocks.single.mockResolvedValueOnce({ data: { id: 'wallet-1', balance_usdt: 100 }, error: null });

        await expect(engine.executeTrade('user-1', 'BTC/USDT', 'BUY', 1, 50000))
            .rejects.toThrow('Insufficient paper balance');
    });
});
