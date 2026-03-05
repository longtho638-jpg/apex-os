import { describe, expect, it } from 'vitest';
import { PaymentMethodSchema, WithdrawalRequestSchema } from '@/lib/validations/finance';

describe('Finance Validation Schemas - Unit Tests', () => {
  describe('WithdrawalRequestSchema', () => {
    it('should accept valid withdrawal request', () => {
      const validData = {
        amount: 100,
        payment_method_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = WithdrawalRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject amount below minimum', () => {
      const invalidData = {
        amount: 5,
        payment_method_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = WithdrawalRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Minimum withdrawal');
      }
    });

    it('should reject amount above maximum', () => {
      const invalidData = {
        amount: 200000,
        payment_method_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = WithdrawalRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Maximum withdrawal');
      }
    });

    it('should reject invalid UUID for payment_method_id', () => {
      const invalidData = {
        amount: 100,
        payment_method_id: 'not-a-uuid',
      };

      const result = WithdrawalRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid payment method');
      }
    });

    it('should reject missing fields', () => {
      const invalidData = { amount: 100 };

      const result = WithdrawalRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('PaymentMethodSchema', () => {
    it('should accept valid crypto wallet payment method', () => {
      const validData = {
        type: 'crypto_wallet' as const,
        name: 'My Crypto Wallet',
        details: { address: '0xABC123', network: 'TRC20' },
      };

      const result = PaymentMethodSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept valid bank transfer payment method', () => {
      const validData = {
        type: 'bank_transfer' as const,
        name: 'My Bank Account',
        details: { accountNumber: '1234567890', bankName: 'Test Bank' },
        is_default: true,
      };

      const result = PaymentMethodSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid type', () => {
      const invalidData = {
        type: 'paypal',
        name: 'PayPal Account',
        details: { email: 'test@example.com' },
      };

      const result = PaymentMethodSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const invalidData = {
        type: 'crypto_wallet' as const,
        name: '',
        details: { address: '0xABC' },
      };

      const result = PaymentMethodSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject name that is too long', () => {
      const invalidData = {
        type: 'crypto_wallet' as const,
        name: 'A'.repeat(100),
        details: { address: '0xABC' },
      };

      const result = PaymentMethodSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty details', () => {
      const invalidData = {
        type: 'crypto_wallet' as const,
        name: 'Wallet',
        details: {},
      };

      const result = PaymentMethodSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Payment details are required');
      }
    });
  });
});
