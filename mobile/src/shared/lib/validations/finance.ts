import { z } from 'zod';

export const WithdrawalRequestSchema = z.object({
    amount: z.number()
        .min(10, 'Minimum withdrawal amount is 10 USDT')
        .max(100000, 'Maximum withdrawal amount is 100,000 USDT'),
    payment_method_id: z.string().uuid('Invalid payment method ID'),
});

export const PaymentMethodSchema = z.object({
    type: z.enum(['crypto_wallet', 'bank_transfer']),
    name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
    details: z.record(z.string(), z.any()).refine((data) => {
        // Basic validation for details based on type could go here
        // For now just ensure it's not empty
        return Object.keys(data).length > 0;
    }, 'Payment details are required'),
    is_default: z.boolean().optional(),
});
