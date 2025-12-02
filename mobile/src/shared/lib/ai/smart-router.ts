import { VertexAI } from '@google-cloud/vertexai';

// OpenRouter client
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

// Vertex AI client (fallback)
// Note: VertexAI requires Google Cloud credentials to be set in environment
const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT || 'apex-os-ai', // Fallback project ID
  location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
});

// Model pricing (per 1M tokens)
const MODEL_COSTS: Record<string, number> = {
  'deepseek/deepseek-chat': 0.14,           // Ultra cheap for simple queries
  'meta-llama/llama-3-8b-instruct': 0.06,   // Cheap for medium
  'anthropic/claude-3-haiku': 0.25,         // Mid-tier
  'anthropic/claude-3.5-sonnet': 3.0,       // Premium for complex
  'google/gemini-pro': 0.5,                 // Vertex fallback
};

export interface SmartRouterConfig {
  userTier: 'free' | 'pro' | 'trader' | 'elite';
  maxCostPerRequest?: number; // USD
  preferredProvider?: 'openrouter' | 'vertex';
}

export interface AIResponse {
  content: string;
  model: string;
  provider: 'openrouter' | 'vertex';
  tokens: number;
  cost: number;
}

export class SmartRouter {
  private config: SmartRouterConfig;

  constructor(config: SmartRouterConfig) {
    this.config = config;
  }

  /**
   * Phân tích độ phức tạp câu hỏi
   * 兵法: 知彼知己 (Know the task before picking weapon)
   */
  private analyzeComplexity(prompt: string): 'simple' | 'medium' | 'complex' {
    const wordCount = prompt.split(' ').length;
    const hasCode = /```|function|class|const|let|var/.test(prompt);
    const hasLongContext = wordCount > 200;
    // const isQuestion = prompt.includes('?');

    // Simple: Short questions, greetings
    if (wordCount < 20 && !hasCode) {
      return 'simple';
    }

    // Complex: Code analysis, long context, technical docs
    if (hasCode || hasLongContext || prompt.includes('analyze') || prompt.includes('explain in detail')) {
      return 'complex';
    }

    // Medium: Everything else
    return 'medium';
  }

  /**
   * Chọn model dựa trên complexity và tier
   * 兵法: 集中兵力 (Use right force for right task)
   */
  private selectModel(complexity: 'simple' | 'medium' | 'complex'): string {
    // Free users get cheapest models
    if (this.config.userTier === 'free') {
      return complexity === 'simple'
        ? 'deepseek/deepseek-chat'          // $0.14/1M
        : 'meta-llama/llama-3-8b-instruct'; // $0.06/1M
    }

    // Pro+ users get better models
    if (complexity === 'simple') {
      return 'meta-llama/llama-3-8b-instruct'; // $0.06/1M
    } else if (complexity === 'medium') {
      return 'anthropic/claude-3-haiku'; // $0.25/1M
    } else {
      return 'anthropic/claude-3.5-sonnet'; // $3.0/1M
    }
  }

  /**
   * Call OpenRouter API
   */
  private async callOpenRouter(
    model: string,
    messages: any[]
  ): Promise<AIResponse> {
    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://apexrebate.com',
        'X-Title': 'ApexOS Trading Platform',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter failed: ${response.status}`);
    }

    const data = await response.json();
    const tokens = data.usage.total_tokens;
    const cost = (tokens / 1_000_000) * (MODEL_COSTS[model] || 0.5);

    return {
      content: data.choices[0].message.content,
      model,
      provider: 'openrouter',
      tokens,
      cost,
    };
  }

  /**
   * Fallback to Vertex AI
   * 兵法: 先為不可勝 (Prepare backup before attack)
   */
  private async callVertexAI(messages: any[]): Promise<AIResponse> {
    const generativeModel = vertexAI.preview.getGenerativeModel({
      model: 'gemini-pro',
    });

    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    const result = await generativeModel.generateContent(prompt);
    const content = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Estimate tokens (rough)
    const tokens = Math.ceil((prompt.length + content.length) / 4);
    const cost = (tokens / 1_000_000) * (MODEL_COSTS['google/gemini-pro'] || 0.5);

    return {
      content,
      model: 'google/gemini-pro',
      provider: 'vertex',
      tokens,
      cost,
    };
  }

  /**
   * Main routing logic with fallback
   * 兵法: 攻守兼備 (Attack with defense)
   */
  async complete(messages: any[]): Promise<AIResponse> {
    const userPrompt = messages[messages.length - 1].content;
    const complexity = this.analyzeComplexity(userPrompt);
    const model = this.selectModel(complexity);

    try {
      // Primary: OpenRouter
      if (process.env.NODE_ENV === 'development') {
        console.log(`[SmartRouter] Complexity: ${complexity}, Model: ${model}, Provider: OpenRouter`);
      }
      return await this.callOpenRouter(model, messages);

    } catch (error) {
      // Fallback: Vertex AI
      console.error('[SmartRouter] OpenRouter failed, falling back to Vertex AI:', error);
      console.log('[SmartRouter] Using Vertex AI - Google Gemini Pro');
      return await this.callVertexAI(messages);
    }
  }
}

// Export singleton
export function createSmartRouter(config: SmartRouterConfig) {
  return new SmartRouter(config);
}
