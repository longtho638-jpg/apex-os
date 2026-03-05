# Research Report: Vercel AI SDK — Architecture & Patterns for Apex OS

**Date:** 2026-03-01
**Context:** Apex OS RaaS AGI Trading Platform — Next.js 16 + React 19 + TypeScript

---

## Executive Summary

Vercel AI SDK (v4-v6, 2025) is a **production-ready abstraction layer** over LLM providers. For Apex OS, it solves three problems:
1. Replace the current manual `fetch` + OpenRouter pattern with typed, streaming-native calls
2. Enable autonomous trading agents via `maxSteps` tool loops (no custom while-loops)
3. Unify provider fallback (OpenRouter → Vertex → Anthropic) behind one interface

**Current state:** Apex OS uses raw `fetch` to OpenRouter, no streaming, no tool calling, custom rate-limiter in Redis. Migrating to AI SDK = streaming out-of-the-box, typed tool calls, structured outputs for trading signals, MCP integration potential.

---

## 1. Architecture: AI SDK Core vs UI vs RSC

```
┌─────────────────────────────────────────────────────┐
│  AI SDK Core (ai package)                           │
│  - generateText / streamText                        │
│  - generateObject / streamObject                    │
│  - tool() + maxSteps agentic loops                  │
│  - Provider-agnostic (OpenAI/Anthropic/Google/etc.) │
│  - Works in Node.js, Edge, serverless               │
└─────────────────────────────────────────────────────┘
         ↑ Server-side only

┌─────────────────────────────────────────────────────┐
│  AI SDK UI (ai/react)                               │
│  - useChat — streaming chat state management        │
│  - useCompletion — single-turn completions          │
│  - Handles SSE parsing, tool-call display           │
│  - Works in React 18/19, Next.js App Router         │
└─────────────────────────────────────────────────────┘
         ↑ Client-side only (React components)

┌─────────────────────────────────────────────────────┐
│  AI SDK RSC (DEPRECATED in 2025)                    │
│  - streamUI was the old pattern for RSC             │
│  - Now: use streamText + toUIMessageStreamResponse  │
│  - RSCs used for layout, not AI output              │
└─────────────────────────────────────────────────────┘
```

**Rule for Apex OS:**
- Agent loops, signal generation, trade execution → **AI SDK Core** (server-side)
- Chat interface, signal display, position stream → **AI SDK UI** (useChat)
- RSC → skip, use Route Handlers + useChat pattern

---

## 2. Core API Reference

### 2.1 generateText — Non-streaming, sync result

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const { text, usage, steps } = await generateText({
  model: openai('gpt-4o'),
  system: 'You are a trading signal analyzer.',
  prompt: 'Analyze BTC/USDT RSI=28, MACD divergence, volume spike. Signal?',
  maxTokens: 500,
  temperature: 0.1, // Low for deterministic trading signals
});
// usage.totalTokens, usage.promptTokens, usage.completionTokens
```

**Use in Apex OS:** Backtest analysis, signal batch processing (no UI needed).

### 2.2 streamText — Streaming with tool calling

```typescript
import { streamText, tool } from 'ai';
import { z } from 'zod';

const result = await streamText({
  model: openai('gpt-4o'),
  maxSteps: 5, // KEY: enables agentic loops
  system: 'You are a Guardian AI trading agent.',
  messages,
  tools: {
    getMarketData: tool({
      description: 'Fetch real-time OHLCV data from exchange',
      parameters: z.object({
        symbol: z.string(),
        timeframe: z.enum(['1m', '5m', '15m', '1h', '4h', '1d']),
      }),
      execute: async ({ symbol, timeframe }) => {
        // Call ccxt or internal exchange service
        return { open: 67200, high: 68100, low: 66800, close: 67900, volume: 12450 };
      },
    }),
    executeTrade: tool({
      description: 'Place a trade order on the exchange',
      parameters: z.object({
        symbol: z.string(),
        side: z.enum(['buy', 'sell']),
        amount: z.number().positive(),
        orderType: z.enum(['market', 'limit']),
        price: z.number().optional(),
      }),
      execute: async (params) => {
        // Human-in-the-loop guard for live trading
        // return { requiresApproval: true, params } for HITL
        return { orderId: 'ORD-001', status: 'filled', avgPrice: 67900 };
      },
    }),
  },
});

return result.toUIMessageStreamResponse(); // or toDataStreamResponse() (v5 compat)
```

### 2.3 generateObject — Typed structured output

```typescript
import { generateObject } from 'ai';
import { z } from 'zod';

const TradingSignalSchema = z.object({
  symbol: z.string(),
  action: z.enum(['BUY', 'SELL', 'HOLD']),
  confidence: z.number().min(0).max(1),
  stopLoss: z.number(),
  takeProfit: z.number(),
  reasoning: z.string(),
  riskScore: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

const { object: signal } = await generateObject({
  model: openai('gpt-4o'),
  schema: TradingSignalSchema,
  prompt: `Analyze: RSI=${rsi}, MACD=${macd}, Volume=${vol}. Generate trade signal.`,
});
// signal is fully typed: { symbol, action, confidence, stopLoss, ... }
```

**Critical for Apex OS:** Guardian/Signal Generator agents should always use `generateObject` — never parse raw LLM text for trading decisions.

### 2.4 streamObject — Real-time structured data streaming

```typescript
const result = await streamObject({
  model: openai('gpt-4o'),
  schema: TradingSignalSchema,
  prompt: 'Analyze portfolio and stream signal updates...',
});

// In client: result.partialObject updates as JSON streams in
// Useful for streaming portfolio analysis to dashboard
return result.toTextStreamResponse();
```

---

## 3. Provider Abstraction

Single swap — all providers use identical API:

```typescript
// Install: pnpm add @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/google-vertex
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { vertex } from '@ai-sdk/google-vertex';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

// OpenRouter via openai-compatible
const openrouter = createOpenAICompatible({
  name: 'openrouter',
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'HTTP-Referer': 'https://apexrebate.com',
    'X-Title': 'ApexOS Trading Platform',
  },
});

// Usage — all identical interface:
const model = openrouter('anthropic/claude-3.5-sonnet'); // cheap complex
const model = openrouter('deepseek/deepseek-chat');       // ultra-cheap simple
const model = vertex('gemini-1.5-pro');                   // Vertex fallback
const model = openai('gpt-4o');                           // direct OpenAI
```

**For Apex OS SmartRouter migration:** Replace custom `callOpenRouter` + `callVertexAI` with provider instances. The current `SmartRouter.complete()` becomes:

```typescript
// lib/ai/smart-router-v2.ts
const MODELS = {
  simple: openrouter('deepseek/deepseek-chat'),
  medium: openrouter('meta-llama/llama-3-8b-instruct'),
  complex: openrouter('anthropic/claude-3.5-sonnet'),
  fallback: vertex('gemini-1.5-pro'),
};

export async function smartComplete(complexity: 'simple' | 'medium' | 'complex', messages: CoreMessage[]) {
  try {
    return await generateText({ model: MODELS[complexity], messages });
  } catch {
    return await generateText({ model: MODELS.fallback, messages }); // Vertex fallback
  }
}
```

---

## 4. Next.js App Router Integration

### 4.1 Route Handler (Server-side streaming)

```typescript
// app/api/ai/chat/route.ts
import { streamText } from 'ai';
import { openrouter } from '@/lib/ai/providers';
import { convertToModelMessages } from 'ai'; // Convert UI messages to model format

export const maxDuration = 30; // Vercel function timeout

export async function POST(req: Request) {
  const { messages, userId } = await req.json();

  // Auth + rate limit first (before LLM call)
  const { allowed, remaining } = await rateLimiter.check(userId);
  if (!allowed) return new Response('Rate limited', { status: 429 });

  const result = await streamText({
    model: openrouter('anthropic/claude-3.5-sonnet'),
    system: SYSTEM_PROMPTS.guardian,
    messages: convertToModelMessages(messages), // Convert UI → model format
    maxSteps: 5,
    tools: { getMarketData, getPositions, getRiskMetrics },
    onFinish: async ({ usage, text, steps }) => {
      // Track usage AFTER stream completes
      await trackUsage(userId, usage.totalTokens);
    },
  });

  return result.toUIMessageStreamResponse();
  // toUIMessageStreamResponse() = new in v5+, replaces toDataStreamResponse()
  // Both work — toDataStreamResponse() still valid in v4/v5
}
```

### 4.2 Client-side useChat

```typescript
// components/ai/TradingChat.tsx
'use client';
import { useChat } from '@ai-sdk/react';

export function TradingChat({ userId }: { userId: string }) {
  const {
    messages,
    sendMessage,
    status, // 'idle' | 'in_progress' | 'awaiting_message'
    error,
  } = useChat({
    api: '/api/ai/chat',
    body: { userId }, // Extra params sent with each request
    onError: (err) => toast.error(err.message),
    onFinish: (message) => {
      // message.parts contains tool calls, text, etc.
    },
  });

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>
          {msg.parts.map((part, i) => {
            switch (part.type) {
              case 'text': return <p key={i}>{part.text}</p>;
              case 'tool-getMarketData':
                return <MarketDataCard key={i} data={part.output} />;
              case 'tool-executeTrade':
                return <TradeConfirmation key={i} params={part.input} result={part.output} />;
            }
          })}
        </div>
      ))}
      <form onSubmit={e => { e.preventDefault(); sendMessage(input); }}>
        <input value={input} onChange={e => setInput(e.target.value)} />
      </form>
    </div>
  );
}
```

### 4.3 Server Actions (alternative to Route Handler)

```typescript
// app/actions/ai-actions.ts
'use server';
import { streamText } from 'ai';
import { createStreamableValue } from 'ai/rsc';

export async function generateTradingSignal(symbol: string) {
  const stream = createStreamableValue('');

  (async () => {
    const { textStream } = await streamText({
      model: openrouter('deepseek/deepseek-chat'),
      prompt: `Generate signal for ${symbol}`,
    });

    for await (const chunk of textStream) {
      stream.update(chunk);
    }
    stream.done();
  })();

  return stream.value;
}
// Client reads with readStreamableValue(value)
```

**Recommendation:** Use Route Handlers (not Server Actions) for streaming — Server Actions have edge cases with concurrent requests and are harder to rate-limit.

---

## 5. Agent Patterns for Trading

### 5.1 Guardian Agent — Multi-step tool loop

```typescript
// lib/ai/agents/guardian.ts
export async function runGuardianAgent(userId: string, portfolioId: string) {
  const result = await generateText({
    model: openrouter('anthropic/claude-3.5-sonnet'),
    maxSteps: 10, // Agent will loop up to 10 times calling tools
    system: `You are Guardian, an autonomous risk management AI.
    Monitor portfolio, detect anomalies, apply stop-losses.
    NEVER execute trades above $10,000 without HITL approval.`,
    prompt: `Monitor portfolio ${portfolioId} for user ${userId}. Take protective action if needed.`,
    tools: {
      getPortfolio: tool({
        description: 'Get current portfolio positions',
        parameters: z.object({ portfolioId: z.string() }),
        execute: async ({ portfolioId }) => supabase.from('positions').select('*').eq('portfolio_id', portfolioId),
      }),
      getRiskMetrics: tool({
        description: 'Calculate VaR, Sharpe, drawdown',
        parameters: z.object({ portfolioId: z.string() }),
        execute: async ({ portfolioId }) => calculateRisk(portfolioId),
      }),
      applyStopLoss: tool({
        description: 'Apply stop-loss to a position. Requires amount < $10K.',
        parameters: z.object({
          positionId: z.string(),
          stopPrice: z.number(),
          amount: z.number().max(10000), // Zod enforces HITL threshold
        }),
        execute: async (params) => executeOrder(params),
      }),
      requestHumanApproval: tool({
        description: 'Flag trade for human review (amount > $10K)',
        parameters: z.object({
          action: z.string(),
          amount: z.number(),
          reason: z.string(),
        }),
        execute: async (params) => {
          await notifyUser(userId, params);
          return { status: 'pending_approval', id: crypto.randomUUID() };
        },
      }),
    },
    onStepFinish: async ({ stepType, toolCalls, text }) => {
      // Log each agent step for audit trail
      await auditLog(userId, { stepType, toolCalls, text });
    },
  });

  return result;
}
```

### 5.2 Signal Generator — Structured output agent

```typescript
// lib/ai/agents/signal-generator.ts
const SignalBatchSchema = z.object({
  signals: z.array(z.object({
    symbol: z.string(),
    action: z.enum(['BUY', 'SELL', 'HOLD']),
    confidence: z.number().min(0).max(1),
    stopLoss: z.number(),
    takeProfit: z.number(),
    timeframe: z.string(),
    reasoning: z.string(),
  })),
  marketCondition: z.enum(['BULL', 'BEAR', 'SIDEWAYS', 'VOLATILE']),
  portfolioAdvice: z.string(),
});

export async function generateSignals(symbols: string[], indicators: MarketIndicators) {
  const { object } = await generateObject({
    model: openrouter('anthropic/claude-3.5-sonnet'),
    schema: SignalBatchSchema,
    temperature: 0.05, // Near-deterministic for signals
    prompt: `
      Analyze these symbols: ${symbols.join(', ')}
      Indicators: ${JSON.stringify(indicators)}
      Generate trading signals with exact stop-loss and take-profit levels.
    `,
  });

  return object; // Fully typed, validated by Zod
}
```

### 5.3 Auditor Agent — Supervisor/orchestrator pattern

```typescript
// lib/ai/agents/auditor.ts
// Auditor routes tasks to specialized agents (supervisor pattern)
export async function runAuditor(task: string) {
  // Step 1: Route to specialist
  const { object: routing } = await generateObject({
    model: openrouter('meta-llama/llama-3-8b-instruct'), // Small fast model for routing
    schema: z.object({
      agent: z.enum(['guardian', 'signal-generator', 'rebalancer', 'compliance']),
      priority: z.enum(['immediate', 'scheduled', 'monitoring']),
      reasoning: z.string(),
    }),
    prompt: `Route this task to the correct specialist agent: ${task}`,
  });

  // Step 2: Dispatch to specialist
  switch (routing.agent) {
    case 'guardian': return runGuardianAgent(userId, portfolioId);
    case 'signal-generator': return generateSignals(watchlist, currentIndicators);
    case 'rebalancer': return runRebalancerAgent(portfolioId, targetAllocation);
  }
}
```

---

## 6. Streaming Protocols

### Data Stream vs Text Stream

| Protocol | Use Case | Format |
|----------|----------|--------|
| `toUIMessageStreamResponse()` | Default for useChat, supports tool calls | SSE JSON parts |
| `toDataStreamResponse()` | v4 compat, also supports tools | SSE JSON (older format) |
| `toTextStreamResponse()` | Simple text only, no tools | Plain text chunks |

**Always use `toUIMessageStreamResponse()`** for Apex OS — it supports tool call visualization in the chat UI.

### SSE Part Types (Data Stream Protocol)

```
data: {"type":"message-start","messageId":"msg-001"}
data: {"type":"text-start","id":"txt-001"}
data: {"type":"text-delta","id":"txt-001","delta":"Analyzing"}
data: {"type":"text-delta","id":"txt-001","delta":" BTC..."}
data: {"type":"text-end","id":"txt-001"}
data: {"type":"tool-getMarketData","toolCallId":"tc-001","state":"call","input":{"symbol":"BTC"}}
data: {"type":"tool-getMarketData","toolCallId":"tc-001","state":"result","output":{...}}
data: {"type":"finish","finishReason":"stop","usage":{"promptTokens":150,"completionTokens":80}}
data: [DONE]
```

---

## 7. Production Patterns

### 7.1 Rate Limiting with Upstash

```typescript
// lib/ai/middleware.ts — wrap route handlers
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(
    // Tier-based limits:
    getTierLimit(userTier), // EXPLORER=10, OPERATOR=50, ARCHITECT=200, SOVEREIGN=1000
    '1 d'
  ),
  analytics: true, // Store analytics in Upstash
});

// In route handler:
const { success, remaining, reset } = await ratelimit.limit(`user:${userId}`);
if (!success) {
  return Response.json({ error: 'Rate limit', remaining: 0, reset }, { status: 429 });
}
```

### 7.2 Caching AI Responses

```typescript
// lib/ai/cache.ts
import { unstable_cache } from 'next/cache';

// Cache signal generation for same inputs (5 min TTL)
export const getCachedSignal = unstable_cache(
  async (symbol: string, indicatorHash: string) => {
    return generateSignals([symbol], getIndicators(symbol));
  },
  ['ai-signal'],
  { revalidate: 300 } // 5 minutes
);

// For Redis-based caching of expensive LLM calls:
export async function cachedGenerate(cacheKey: string, generator: () => Promise<string>) {
  const cached = await redis.get(cacheKey);
  if (cached) return cached as string;
  const result = await generator();
  await redis.setex(cacheKey, 300, result); // 5 min TTL
  return result;
}
```

### 7.3 Error Handling

```typescript
import { AISDKError, APICallError, RetryError } from 'ai';

try {
  const result = await generateText({ model, messages });
} catch (error) {
  if (error instanceof APICallError) {
    // Provider returned non-200: error.statusCode, error.responseBody
    if (error.statusCode === 429) return fallbackToVertexAI(messages);
    logger.error('Provider error', { status: error.statusCode });
  }

  if (error instanceof RetryError) {
    // All retries exhausted
    return { error: 'AI service unavailable', retry: true };
  }

  if (error instanceof AISDKError) {
    // Generic SDK error
    logger.error('AI SDK error', { name: error.name, message: error.message });
  }
}
```

### 7.4 Token Usage Tracking

```typescript
const result = await streamText({
  model,
  messages,
  onFinish: async ({ usage, finishReason, text }) => {
    // Called once stream completes — guaranteed
    await db.insert('ai_usage').values({
      userId,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
      model: model.modelId,
      cost: calculateCost(model.modelId, usage),
      finishReason,
      timestamp: new Date(),
    });
  },
});
```

### 7.5 Multi-provider Fallback Pattern

```typescript
// lib/ai/providers.ts
export async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  fallback2?: () => Promise<T>
): Promise<T> {
  try {
    return await primary();
  } catch (e) {
    logger.warn('Primary provider failed, trying fallback', e);
    try {
      return await fallback();
    } catch (e2) {
      if (fallback2) return await fallback2();
      throw e2;
    }
  }
}

// Usage:
const result = await withFallback(
  () => generateText({ model: openrouter('anthropic/claude-3.5-sonnet'), messages }),
  () => generateText({ model: openrouter('deepseek/deepseek-chat'), messages }),
  () => generateText({ model: vertex('gemini-1.5-pro'), messages }),
);
```

---

## 8. MCP (Model Context Protocol) Integration

For future expansion — connect Guardian agent to exchange APIs via MCP:

```typescript
import { experimental_createMCPClient } from '@ai-sdk/mcp';

// Connect to a local MCP server that wraps ccxt
const exchangeMCP = await experimental_createMCPClient({
  transport: 'stdio',
  command: 'node',
  args: ['./mcp-servers/ccxt-server.js'],
});

const result = await generateText({
  model: openai('gpt-4o'),
  tools: {
    ...exchangeMCP.tools, // All ccxt operations become tools automatically
    ...customTools,
  },
  prompt: 'Check BTC/USDT price and execute a $100 test buy.',
});
```

**MCP is marked `experimental_` but stable enough for production in 2025.**

---

## 9. Apex OS Migration Plan (Current → AI SDK)

### Current State Problems
- `SmartRouter`: raw `fetch` to OpenRouter, no streaming, no tool calling
- Chat route: returns JSON (blocking), not streaming — bad UX
- No typed structured output → parse raw LLM text for signals (dangerous)
- No `onFinish` callback → usage tracking is manual + racy

### Migration Priority
| Priority | Current | AI SDK Replacement |
|----------|---------|-------------------|
| P0 | `callOpenRouter()` raw fetch | `createOpenAICompatible()` provider |
| P0 | Chat route returns JSON | `streamText().toUIMessageStreamResponse()` |
| P0 | Signal parsing raw text | `generateObject()` + Zod schema |
| P1 | Manual usage tracking | `onFinish({ usage })` callback |
| P1 | Guardian custom loop | `maxSteps` + tool definitions |
| P2 | Vertex direct import | `@ai-sdk/google-vertex` provider |
| P2 | Rate limiter manual | Upstash `@upstash/ratelimit` integration |

### Package Install

```bash
pnpm add ai @ai-sdk/react @ai-sdk/openai-compatible @ai-sdk/google-vertex @ai-sdk/openai @ai-sdk/anthropic
# Note: ai package v4+ required for maxSteps + tool loop
```

---

## Unresolved Questions

1. **OpenRouter compatibility**: `createOpenAICompatible` should work with OpenRouter but need to verify tool calling passes through correctly (OpenRouter relays tool calls to underlying model — may have latency overhead).

2. **Streaming with existing rate-limiter**: Current `RateLimiter` (Redis-based) checks limits synchronously before request. With streaming, need to decide if token-based limits apply during stream or post-stream (via `onFinish`).

3. **HITL (Human-in-the-Loop) for live trades**: The `requestHumanApproval` tool pattern above is a placeholder — need WebSocket or Supabase Realtime to push approval requests to user dashboard in real-time.

4. **maxSteps cost explosion**: Setting `maxSteps: 10` with `claude-3.5-sonnet` on 10-step chains = potentially 10x cost per Guardian run. Need agent-specific model selection (complex agent = cheap model for routing, expensive only for final decision).

5. **Edge runtime vs Node.js**: Some providers (especially Vertex AI with `@google-cloud/vertexai`) don't support Edge runtime. AI SDK's `@ai-sdk/google-vertex` uses REST so it's Edge-compatible — verify this before migrating Vertex calls.

---

## References

- [AI SDK Core Docs](https://ai-sdk.dev/docs/ai-sdk-core/overview)
- [Next.js App Router Getting Started](https://ai-sdk.dev/docs/getting-started/nextjs-app-router)
- [Stream Protocols](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol)
- [Advanced Rate Limiting](https://ai-sdk.dev/docs/advanced/rate-limiting)
- [Upstash + AI SDK](https://upstash.com/blog/ai-sdk-and-upstash)
- [AI SDK UI: Stream Protocols](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol)
