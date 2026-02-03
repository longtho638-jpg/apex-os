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
        rpc: vi.fn(),
    };
});

vi.mock('@supabase/supabase-js', () => ({
    createClient: () => ({
        from: mocks.from,
        rpc: mocks.rpc
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
        mocks.rpc.mockResolvedValue({ data: null, error: null });
    });

    it('should create a wallet if none exists', async () => {
        mocks.single.mockResolvedValueOnce({ data: { id: 'wallet-1', balance_usdt: 100000 }, error: null });

        const wallet = await engine.createWallet('user-1');
        expect(wallet).toBeDefined();
        // createWallet is now just a getter/checker, logic moved to RPC
        expect(mocks.insert).not.toHaveBeenCalled();
    });

    it('should execute a BUY order', async () => {
        // Mock RPC success
        mocks.rpc.mockResolvedValueOnce({ data: { id: 'trade-1' }, error: null });

        const result = await engine.executeTrade('user-1', 'BTC/USDT', 'BUY', 1, 50000);

        expect(mocks.rpc).toHaveBeenCalledWith('execute_paper_trade', expect.objectContaining({
            p_user_id: 'user-1',
            p_symbol: 'BTC/USDT',
            p_side: 'BUY',
            p_quantity: 1,
            p_price: 50000
        }));
    });

    it('should reject BUY if insufficient funds', async () => {
        // Mock RPC error
        mocks.rpc.mockResolvedValueOnce({
            data: null,
            error: { message: 'Insufficient paper balance' }
        });

        await expect(engine.executeTrade('user-1', 'BTC/USDT', 'BUY', 1, 50000))
            .rejects.toThrow('Insufficient paper balance');
    });
});
