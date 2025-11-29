import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from '@/lib/utils';

describe('Utils - Unit Tests', () => {
    describe('formatCurrency', () => {
        it('should format positive numbers correctly', () => {
            expect(formatCurrency(1000.50)).toBe('1,000.50 USDT');
        });

        it('should format zero', () => {
            expect(formatCurrency(0)).toBe('0.00 USDT');
        });

        it('should format negative numbers', () => {
            expect(formatCurrency(-500.75)).toBe('-500.75 USDT');
        });

        it('should handle very large numbers', () => {
            expect(formatCurrency(1000000000.99)).toBe('1,000,000,000.99 USDT');
        });

        it('should respect custom currency parameter', () => {
            expect(formatCurrency(100, 'BTC')).toBe('100.00 BTC');
        });
    });

    describe('formatDate', () => {
        it('should format ISO date string correctly', () => {
            const result = formatDate('2025-11-25T10:30:00Z');
            expect(result).toContain('Nov');
            expect(result).toContain('25');
            expect(result).toContain('2025');
        });

        it('should include time', () => {
            const result = formatDate('2025-11-25T14:30:00Z');
            expect(result).toMatch(/\d{1,2}:\d{2}/); // HH:MM format
        });
    });
});
