/**
 * Unified AI Provider — Vercel AI SDK wrapper over OpenRouter + Vertex fallback.
 * 兵法: 集中兵力 (Concentrate force; right model for right task)
 */
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { LegacyTierId, TierId } from '@apex-os/vibe-payment';
import type { LanguageModel } from 'ai';
import { logger } from '@/lib/logger';

// ---- Model registry ----
const MODELS = {
  cheapest: 'deepseek/deepseek-chat', // $0.14/1M — Explorer simple
  cheap: 'meta-llama/llama-3-8b-instruct', // $0.06/1M — Explorer complex / Operator+ simple
  mid: 'anthropic/claude-3-haiku', // $0.25/1M — Operator+ medium
  premium: 'anthropic/claude-3.5-sonnet', // $3.0/1M  — Operator+ complex
  vertex: 'google/gemini-pro', // Vertex fallback
} as const;

export type ModelTier = keyof typeof MODELS;
export type Complexity = 'simple' | 'medium' | 'complex';

/** OpenRouter-compatible provider via AI SDK */
export const openrouter = createOpenAICompatible({
  name: 'openrouter',
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY ?? '',
  headers: {
    'HTTP-Referer': 'https://apexrebate.com',
    'X-Title': 'ApexOS Trading Platform',
  },
});

/**
 * Analyse prompt complexity — preserved from SmartRouter.
 * 兵法: 知彼知己 (Know the task before picking the weapon)
 */
export function analyzeComplexity(prompt: string): Complexity {
  const wordCount = prompt.split(' ').length;
  const hasCode = /```|function|class|const|let|var/.test(prompt);
  const hasLongContext = wordCount > 200;

  if (wordCount < 20 && !hasCode) return 'simple';
  if (hasCode || hasLongContext || /analyze|explain in detail/.test(prompt)) return 'complex';
  return 'medium';
}

/**
 * Map user tier + complexity → model ID string.
 * Returns model ID ready for openrouter(modelId).
 */
export function selectModelId(userTier: TierId | LegacyTierId | string, complexity: Complexity): string {
  const isExplorer = userTier === 'EXPLORER' || userTier === 'FREE' || userTier === 'free' || userTier === 'explorer';

  if (isExplorer) {
    return complexity === 'simple' ? MODELS.cheapest : MODELS.cheap;
  }

  // Operator+ tiers
  if (complexity === 'simple') return MODELS.cheap;
  if (complexity === 'medium') return MODELS.mid;
  return MODELS.premium;
}

/**
 * Convenience: get the AI SDK model object for a given tier + prompt.
 */
export function getModel(userTier: TierId | LegacyTierId | string, prompt: string): LanguageModel {
  const complexity = analyzeComplexity(prompt);
  const modelId = selectModelId(userTier, complexity);

  if (process.env.NODE_ENV === 'development') {
    logger.info(`[AI Provider] tier=${userTier} complexity=${complexity} model=${modelId}`);
  }

  return openrouter(modelId) as unknown as LanguageModel;
}

/**
 * Lazy Vertex AI fallback provider factory.
 * Returns a generateContent-compatible object; call only when OpenRouter fails.
 */
export async function getVertexModel(modelName = 'gemini-pro') {
  const { VertexAI } = await import('@google-cloud/vertexai');
  const vertex = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT ?? 'apex-os-ai',
    location: process.env.GOOGLE_CLOUD_LOCATION ?? 'us-central1',
  });
  return vertex.preview.getGenerativeModel({ model: modelName });
}

export { MODELS };
