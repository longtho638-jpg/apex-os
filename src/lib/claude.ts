import OpenAI from 'openai';
import { logger } from '@/lib/logger';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export class ClaudeClient {
  private client: OpenAI;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

    if (!key) {
      throw new Error('API key not found. Set OPENROUTER_API_KEY or OPENAI_API_KEY in .env.local');
    }

    this.client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: key,
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Apex-OS',
      },
    });
  }

  /**
   * Generate production-ready code
   * @param prompt - Code generation prompt
   * @param context - Additional context for code generation
   * @returns Generated code
   */
  async generateCode(prompt: string, context?: string): Promise<string> {
    const systemPrompt = `You are an expert code generation assistant.
Generate clean, production-ready code.
Follow best practices and conventions.
Include proper error handling and type safety.
${context ? `Context: ${context}` : ''}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ];

    return this.chat({
      messages,
      temperature: 0.3, // Lower temperature for more deterministic code
      max_tokens: 4096,
    });
  }

  /**
   * Chat with Claude
   * @param options - Chat options
   * @returns Response text
   */
  async chat(options: ChatOptions): Promise<string> {
    const { messages, model = 'anthropic/claude-3.5-sonnet', temperature = 0.7, max_tokens = 2048 } = options;

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: messages as any,
        temperature,
        max_tokens,
      });

      return response.choices[0]?.message?.content || 'No response generated.';
    } catch (error) {
      logger.error('Claude API error:', error);
      throw new Error('Failed to get response from Claude');
    }
  }

  /**
   * Stream chat responses
   * @param options - Chat options
   * @yields Response chunks
   */
  async *streamChat(options: ChatOptions): AsyncGenerator<string> {
    const { messages, model = 'anthropic/claude-3.5-sonnet', temperature = 0.7, max_tokens = 2048 } = options;

    try {
      const stream = await this.client.chat.completions.create({
        model,
        messages: messages as any,
        temperature,
        max_tokens,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      logger.error('Claude streaming error:', error);
      throw new Error('Failed to stream response from Claude');
    }
  }
}

// Singleton instance
let instance: ClaudeClient;

/**
 * Get Claude client instance
 * @returns ClaudeClient singleton
 */
export function getClaudeClient(): ClaudeClient {
  if (!instance) {
    instance = new ClaudeClient();
  }
  return instance;
}
