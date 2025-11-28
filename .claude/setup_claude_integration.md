# Setup Claude Integration for Apex-OS

**Based on**: ClaudeKit v0.0.1 (Nov 9, 2025)
**Goal**: Enable Claude 3.5 Sonnet code generation via OpenRouter

## 1. Install Dependencies

```bash
npm install openai@^4.75.1
```

## 2. Add OpenRouter Client

Create `src/lib/claude.ts`:

```typescript
import OpenAI from 'openai';

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
    this.client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey || process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Apex-OS',
      },
    });
  }

  async generateCode(prompt: string, context?: string): Promise<string> {
    const systemPrompt = `You are an expert code generation assistant. 
Generate clean, production-ready code.
Follow best practices and conventions.
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

  async chat(options: ChatOptions): Promise<string> {
    const {
      messages,
      model = 'anthropic/claude-3.5-sonnet',
      temperature = 0.7,
      max_tokens = 2048,
    } = options;

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens,
      });

      return response.choices[0]?.message?.content || 'No response generated.';
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error('Failed to get response from Claude');
    }
  }

  async *streamChat(options: ChatOptions): AsyncGenerator<string> {
    const {
      messages,
      model = 'anthropic/claude-3.5-sonnet',
      temperature = 0.7,
      max_tokens = 2048,
    } = options;

    try {
      const stream = await this.client.chat.completions.create({
        model,
        messages,
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
      console.error('Claude streaming error:', error);
      throw new Error('Failed to stream response from Claude');
    }
  }
}

// Singleton instance
let instance: ClaudeClient;

export function getClaudeClient(): ClaudeClient {
  if (!instance) {
    instance = new ClaudeClient();
  }
  return instance;
}
```

## 3. Environment Setup

Add to `.env.local`:

```bash
OPENROUTER_API_KEY=sk_live_xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get API key from: https://openrouter.ai/

## 4. Create API Routes

Create `src/app/api/claude/route.ts`:

```typescript
import { getClaudeClient } from '@/lib/claude';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, context, mode = 'chat' } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const claude = getClaudeClient();

    if (mode === 'code') {
      const response = await claude.generateCode(prompt, context);
      return NextResponse.json({ response });
    }

    if (mode === 'stream') {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of claude.streamChat({
              messages: [
                { role: 'user', content: prompt },
              ],
            })) {
              controller.enqueue(encoder.encode(chunk));
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      });
    }

    const response = await claude.chat({
      messages: [{ role: 'user', content: prompt }],
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

## 5. React Component Integration

Create `src/components/ClaudeAssistant.tsx`:

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ClaudeAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'code'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const message = input.trim();
    if (!message) return;

    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: message,
          mode,
        }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border">
      <div className="flex gap-2 p-4 border-b">
        <button
          onClick={() => setMode('chat')}
          className={`px-3 py-2 rounded ${
            mode === 'chat' ? 'bg-blue-500 text-white' : 'bg-gray-100'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setMode('code')}
          className={`px-3 py-2 rounded ${
            mode === 'code' ? 'bg-blue-500 text-white' : 'bg-gray-100'
          }`}
        >
          Code
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-black'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded animate-pulse">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder={`Ask Claude to ${mode === 'code' ? 'generate code' : 'chat'}...`}
          className="flex-1 px-4 py-2 border rounded"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
```

## 6. Create .claude Commands

Create `.claude/commands/generate-code.md`:

```markdown
---
description: Generate code with Claude
argument-hint: [component-type] [requirements]
---

## Arguments
- COMPONENT_TYPE: $1 (e.g., React component, API route, utility)
- REQUIREMENTS: $2 (specific requirements)

## Mission
Generate production-ready code for: $COMPONENT_TYPE

## Requirements
$REQUIREMENTS

## Standards
- Follow Next.js best practices
- Use TypeScript strict mode
- Include error handling
- Add JSDoc comments
- Follow project conventions

## Output Format
- Clean, readable code
- No console.logs for production
- Proper error handling
- Type-safe implementations
```

## 7. Verification

```bash
# Check dependencies installed
npm list openai

# Test Claude integration
curl -X POST http://localhost:3000/api/claude \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello, what is 2+2?","mode":"chat"}'
```

## 8. Common Models to Test

| Model | Use Case | Speed |
|-------|----------|-------|
| `anthropic/claude-3.5-sonnet` | Code generation (default) | Fast |
| `anthropic/claude-3-opus` | Complex reasoning | Slow |
| `anthropic/claude-3-haiku` | Light tasks | Very Fast |

## Next Steps

- [ ] Install OpenAI SDK
- [ ] Create `src/lib/claude.ts`
- [ ] Add `.env.local` with API key
- [ ] Create API routes
- [ ] Build React components
- [ ] Add `.claude/commands`
- [ ] Test code generation
- [ ] Monitor API usage

