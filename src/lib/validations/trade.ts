import { z } from 'zod';

export const OrderTypeSchema = z.enum(['market', 'limit', 'stop_loss', 'stop_limit', 'oco']);
export const OrderSideSchema = z.enum(['buy', 'sell']);

export const BaseOrderSchema = z.object({
  symbol: z.string().min(3).max(20),
  side: OrderSideSchema,
  type: OrderTypeSchema,
  quantity: z.number().positive(),
  price: z.number().positive().optional(), // Required for Limit
  stop_price: z.number().positive().optional(), // Required for Stop
  limit_price: z.number().positive().optional(), // For OCO/Stop-Limit
});

export const orderRefinement = (data: any) => {
  if (data.type === 'limit' && !data.price) return false;
  if ((data.type === 'stop_loss' || data.type === 'stop_limit') && !data.stop_price) return false;
  if (data.type === 'stop_limit' && !data.price) return false;
  if (data.type === 'oco' && (!data.price || !data.stop_price)) return false;
  return true;
};

export const CreateOrderSchema = BaseOrderSchema.refine(orderRefinement, {
  message: 'Invalid price parameters for the selected order type',
});

export type CreateOrderRequest = z.infer<typeof CreateOrderSchema>;
