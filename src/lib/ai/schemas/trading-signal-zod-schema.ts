/**
 * Zod schemas for structured AI output — trading signals and volume strategies.
 * Used with Vercel AI SDK generateObject() for type-safe LLM responses.
 */
import { z } from 'zod';

/** Directional signal schema for quant analysis ("The General" persona) */
export const TradingSignalSchema = z.object({
  signal: z.enum(['LONG', 'SHORT', 'NEUTRAL']),
  confidence: z.number().min(0).max(100).describe('Probability of success (0-100)'),
  entry_zone: z.object({
    min: z.number(),
    max: z.number(),
  }),
  stop_loss: z.number(),
  take_profit_targets: z.array(z.number()).length(3),
  leverage_limit: z.number().min(1).max(100),
  reasoning: z.string().describe('Sun Tzu metaphor-based concise rationale'),
});

export type TradingSignal = z.infer<typeof TradingSignalSchema>;

/** Volume/rebate farming strategy schema ("The Farmer" persona) */
export const VolumeStrategySchema = z.object({
  strategy_type: z.enum(['GRID_BOT', 'DELTA_NEUTRAL_HEDGE', 'HIGH_FREQ_SCALP']),
  pair: z.string(),
  leverage: z.number().min(1).max(20).describe('Safe leverage for volume farming'),
  grid_range: z.object({
    low: z.number(),
    high: z.number(),
    grids: z.number().int().positive(),
  }),
  hedge_ratio: z.number().describe('1.0 = perfect delta neutral'),
  estimated_volume_24h: z.number(),
  estimated_rebate_earnings: z.number(),
  reasoning: z.string().describe('Why this pair/range suits farming'),
});

export type VolumeStrategy = z.infer<typeof VolumeStrategySchema>;
