import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignalGenerator } from '../signal-generator';
import { CONFIG } from '../../config';

// Mock Logger to prevent console output during tests
vi.mock('../utils/logger', () => ({
    Logger: vi.fn(() => ({
        info: vi.fn(),
        error: vi.fn(),
    })),
}));

// Mock Supabase client parts
const mockSupabaseQueryMethods = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    // insert is part of the "from" chain too
    insert: vi.fn(), // Moved insert here
};

const mockSupabaseClient = {
    from: vi.fn(() => mockSupabaseQueryMethods), // from() will return our query methods
    // insert: vi.fn(), // Removed from here, now part of mockSupabaseQueryMethods
};

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => mockSupabaseClient),
}));


describe('SignalGenerator', () => {
    let signalGenerator: SignalGenerator;

    beforeEach(() => {
        vi.clearAllMocks(); // Clear all mocks including those set in vi.mock calls

        // Reset mock implementations for common chain methods
        mockSupabaseClient.from.mockClear().mockImplementation(() => mockSupabaseQueryMethods);
        mockSupabaseQueryMethods.select.mockClear().mockReturnThis();
        mockSupabaseQueryMethods.eq.mockClear().mockReturnThis();
        mockSupabaseQueryMethods.order.mockClear().mockReturnThis();
        mockSupabaseQueryMethods.limit.mockClear().mockReturnThis(); // Default return this, will be overridden by mockResolvedValueOnce in tests
        
        mockSupabaseQueryMethods.insert.mockClear().mockResolvedValue({ data: null, error: null }); // Default for saveSignal, now on query methods

        signalGenerator = new SignalGenerator();
    });

    describe('calculateRSI', () => {
        it('should return 50 for insufficient data', () => {
            const prices = [10, 11, 12]; // Less than default period + 1 (15)
            expect(signalGenerator.calculateRSI(prices)).toBe(50);
        });

        it('should return 100 if there are no losses', () => {
            const prices = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150];
            expect(signalGenerator.calculateRSI(prices)).toBe(100);
        });

        it('should calculate RSI correctly for a typical scenario', () => {
            const prices = [
                44.34, 44.09, 43.87, 44.02, 45.67, 43.68, 41.52, 42.02, 41.66, 42.66,
                43.34, 43.83, 44.75, 43.43, 41.42, 41.13, 41.46, 42.47, 42.45, 42.49
            ];
            const expectedRSI = 44.65;
            expect(signalGenerator.calculateRSI(prices)).toBeCloseTo(expectedRSI, 2);
        });

        it('should calculate RSI correctly for a downward trend', () => {
            const prices = [
                100, 99, 98, 97, 96, 95, 94, 93, 92, 91, 90, 89, 88, 87, 86, 85, 84, 83, 82, 81
            ];
            const expectedRSI = 0;
            expect(signalGenerator.calculateRSI(prices)).toBeCloseTo(expectedRSI, 2);
        });
    });

    describe('calculateMACD', () => {
        it('should calculate MACD correctly for a simple trend', () => {
            const prices = Array.from({ length: 50 }, (_, i) => 100 + i); // Upward trend
            const { macd, signal, histogram } = signalGenerator.calculateMACD(prices);

            expect(histogram).toBeCloseTo(0);
            expect(macd).toBeCloseTo(signal);
        });

        it('should return expected MACD values for known data', () => {
            const prices = [
                10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
                31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
                51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70,
                71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90,
                91, 92, 93, 94, 95, 96, 97, 98, 99, 100
            ];
            const { macd, signal, histogram } = signalGenerator.calculateMACD(prices);
            expect(macd).toBeCloseTo(7, 2);
            expect(signal).toBeCloseTo(7, 2);
            expect(histogram).toBeCloseTo(0, 2);
        });
    });

    describe('generateSignal', () => {
        it('should return a HOLD signal for insufficient market data', async () => {
            const insufficientMarketData = Array(10).fill({ price: 100, updated_at: new Date().toISOString() });
            mockSupabaseQueryMethods.limit.mockResolvedValueOnce({ data: insufficientMarketData, error: null }); // Mock the actual limit call

            const signal = await signalGenerator.generateSignal('TESTSYM');
            expect(signal.type).toBe('HOLD');
            expect(signal.reason).toBe('Insufficient data');
            expect(signal.confidence).toBe(0);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('market_data');
            expect(mockSupabaseQueryMethods.insert).not.toHaveBeenCalled(); // saveSignal should not be called
        });

        it('should return a BUY signal when RSI is oversold and MACD is neutral', async () => {
            const mockMarketData = Array(50).fill({ price: 100, updated_at: new Date().toISOString() });
            mockSupabaseQueryMethods.limit.mockResolvedValueOnce({ data: mockMarketData, error: null });

            // Mock RSI to be oversold
            const originalCalculateRSI = signalGenerator.calculateRSI;
            signalGenerator.calculateRSI = vi.fn(() => 20); // Force RSI to oversold

            // Mock MACD to be strictly neutral
            const originalCalculateMACD = signalGenerator.calculateMACD;
            signalGenerator.calculateMACD = vi.fn(() => ({ macd: 0, signal: 0, histogram: 0 }));

            const signal = await signalGenerator.generateSignal('TESTSYM');
            expect(signal.type).toBe('BUY');
            expect(signal.reason).toContain('RSI oversold (20.0)'); // Check against mocked RSI value
            expect(signal.confidence).toBeCloseTo(0.7); // Use toBeCloseTo for float comparison
            expect(mockSupabaseQueryMethods.insert).toHaveBeenCalledTimes(1); // Now checking on mockSupabaseQueryMethods.insert

            signalGenerator.calculateRSI = originalCalculateRSI; // Restore original
            signalGenerator.calculateMACD = originalCalculateMACD;
        });

        it('should return a SELL signal when RSI is overbought and MACD is neutral', async () => {
            const mockMarketData = Array(50).fill({ price: 100, updated_at: new Date().toISOString() });
            mockSupabaseQueryMethods.limit.mockResolvedValueOnce({ data: mockMarketData, error: null });

            // Mock RSI to be overbought
            const originalCalculateRSI = signalGenerator.calculateRSI;
            signalGenerator.calculateRSI = vi.fn(() => 80); // Force RSI to overbought

            // Mock MACD to be strictly neutral
            const originalCalculateMACD = signalGenerator.calculateMACD;
            signalGenerator.calculateMACD = vi.fn(() => ({ macd: 0, signal: 0, histogram: 0 }));

            const signal = await signalGenerator.generateSignal('TESTSYM');
            expect(signal.type).toBe('SELL');
            expect(signal.reason).toContain('RSI overbought (80.0)'); // Check against mocked RSI value
            expect(signal.confidence).toBeCloseTo(0.7); // Use toBeCloseTo for float comparison
            expect(mockSupabaseQueryMethods.insert).toHaveBeenCalledTimes(1); // Now checking on mockSupabaseQueryMethods.insert

            signalGenerator.calculateRSI = originalCalculateRSI; // Restore original
            signalGenerator.calculateMACD = originalCalculateMACD;
        });

        it('should adjust confidence with MACD bullish confirmation for BUY signal', async () => {
            const mockMarketData = Array(50).fill({ price: 100, updated_at: new Date().toISOString() });
            mockSupabaseQueryMethods.limit.mockResolvedValueOnce({ data: mockMarketData, error: null });

            // Mock RSI to be oversold
            const originalCalculateRSI = signalGenerator.calculateRSI;
            signalGenerator.calculateRSI = vi.fn(() => 20); // Force RSI to oversold

            // Mock MACD to be bullish
            const originalCalculateMACD = signalGenerator.calculateMACD;
            signalGenerator.calculateMACD = vi.fn(() => ({ macd: 1, signal: 0.5, histogram: 0.5 }));

            const signal = await signalGenerator.generateSignal('TESTSYM');
            expect(signal.type).toBe('BUY');
            expect(signal.reason).toContain('RSI oversold');
            expect(signal.reason).toContain('MACD bullish crossover');
            expect(signal.confidence).toBeCloseTo(0.9); // Use toBeCloseTo for float comparison

            signalGenerator.calculateRSI = originalCalculateRSI; // Restore original
            signalGenerator.calculateMACD = originalCalculateMACD; // Restore original
        });

        it('should save the generated signal to Supabase', async () => {
            const mockMarketData = Array(50).fill({ price: 100, updated_at: new Date().toISOString() });
            mockSupabaseQueryMethods.limit.mockResolvedValueOnce({ data: mockMarketData, error: null });
            mockSupabaseQueryMethods.insert.mockResolvedValueOnce({ data: null, error: null }); // Now checking on mockSupabaseQueryMethods.insert


            const signal = await signalGenerator.generateSignal('TESTSYM');

            expect(mockSupabaseQueryMethods.insert).toHaveBeenCalledTimes(1); // Now checking on mockSupabaseQueryMethods.insert
            expect(mockSupabaseQueryMethods.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    symbol: 'TESTSYM',
                    signal_type: signal.type,
                    confidence: signal.confidence,
                })
            );
        });

        it('should handle errors during signal generation gracefully', async () => {
            // Mock `limit` to reject, simulating a fetch error
            mockSupabaseQueryMethods.limit.mockRejectedValueOnce(new Error('Supabase fetch failed'));

            const signal = await signalGenerator.generateSignal('FAILS_SYM');
            expect(signal.type).toBe('HOLD');
            expect(signal.reason).toBe('Error generating signal');
            expect(signal.confidence).toBe(0);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('market_data');
            expect(mockSupabaseQueryMethods.insert).not.toHaveBeenCalled(); // saveSignal should not be called on error
        });
    });
});
