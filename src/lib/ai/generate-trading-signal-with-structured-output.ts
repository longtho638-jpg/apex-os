/**
 * Generate structured trading signals using Vercel AI SDK generateObject().
 * Replaces raw JSON parsing from DeepSeekClient.generateQuantStrategy().
 * 兵法: 攻守兼備 (Attack with defense — structured output prevents parse failures)
 */

import type { LegacyTierId, TierId } from '@apex-os/vibe-payment';
import { generateObject, type LanguageModel } from 'ai';
import { logger } from '@/lib/logger';
import { analyzeComplexity, getModel, getVertexModel, openrouter, selectModelId } from './provider';
import {
  type TradingSignal,
  TradingSignalSchema,
  type VolumeStrategy,
  VolumeStrategySchema,
} from './schemas/trading-signal-zod-schema';

const QUANT_SYSTEM_PROMPT = `
You are "The General" (Sun Tzu of Trading) - a Senior Quantitative AI.
1. "Know the enemy and know yourself": Analyze market structure and risk parameters.
2. "Win without fighting": The best trade is NO trade if the edge is weak. Capital preservation is victory.
3. "Attack where they are unprepared": Look for asymmetric risk/reward setups.
4. "Move swift as the wind": Identify momentum setups that minimize time in the market.
If the probability of success is < 70%, signal MUST be "NEUTRAL". Do not force trades.
`.trim();

const VOLUME_SYSTEM_PROMPT = `
You are "The Farmer" - a Senior Quantitative AI specializing in Market Making and Rebate Arbitrage.
Goal: MAXIMIZE TRADING VOLUME while maintaining DELTA NEUTRALITY (Zero directional risk).
Strategy focus: High Turnover, Delta Neutral hedging, Grid Trading within volatility ranges.
`.trim();

/**
 * Generate a directional trading signal for the given market context.
 * Uses generateObject() — no JSON parsing, type-safe output guaranteed.
 */
export async function generateTradingSignal(
  marketContext: string,
  userTier: TierId | LegacyTierId | string = 'EXPLORER',
): Promise<TradingSignal> {
  const complexity = analyzeComplexity(marketContext);
  const modelId = selectModelId(userTier, complexity);

  try {
    const result = await generateObject({
      model: openrouter(modelId) as unknown as LanguageModel,
      schema: TradingSignalSchema,
      system: QUANT_SYSTEM_PROMPT,
      prompt: marketContext,
      temperature: 0.2,
    });

    const signal = result.object as TradingSignal;
    if (!signal) throw new Error('generateObject returned empty signal');

    logger.info(`[TradingSignal] model=${modelId} signal=${signal.signal} confidence=${signal.confidence}`);
    return signal;
  } catch (error) {
    logger.error('[TradingSignal] OpenRouter failed, falling back to Vertex AI:', error);
    return generateTradingSignalViaVertex(marketContext);
  }
}

/**
 * Generate a volume/rebate farming strategy for the given market context.
 */
export async function generateVolumeStrategy(
  marketContext: string,
  userTier: TierId | LegacyTierId | string = 'EXPLORER',
): Promise<VolumeStrategy> {
  const model = getModel(userTier, marketContext);

  const result = await generateObject({
    model,
    schema: VolumeStrategySchema,
    system: VOLUME_SYSTEM_PROMPT,
    prompt: `User Tier: ${userTier}\n${marketContext}`,
    temperature: 0.2,
  });

  const strategy = result.object as VolumeStrategy;
  if (!strategy) throw new Error('generateObject returned empty volume strategy');

  logger.info(`[VolumeStrategy] strategy=${strategy.strategy_type} pair=${strategy.pair}`);
  return strategy;
}

/** Vertex AI fallback — structured output via prompt + manual parse (last resort) */
async function generateTradingSignalViaVertex(marketContext: string): Promise<TradingSignal> {
  const model = await getVertexModel('gemini-pro');
  const prompt = [
    QUANT_SYSTEM_PROMPT,
    'Output valid JSON matching this shape: { signal, confidence, entry_zone: {min,max}, stop_loss, take_profit_targets: [n,n,n], leverage_limit, reasoning }',
    marketContext,
  ].join('\n\n');

  const result = await model.generateContent(prompt);
  const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  try {
    const json = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
    return TradingSignalSchema.parse(json);
  } catch (e) {
    logger.error('[TradingSignal] Vertex parse failed:', e);
    throw new Error('Vertex AI fallback returned invalid trading signal');
  }
}
