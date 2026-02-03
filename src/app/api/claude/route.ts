import { logger } from '@/lib/logger';
import { getClaudeClient } from '@/lib/claude';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/claude
 * Generate code or chat with Claude
 */
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

    // Code generation mode
    if (mode === 'code') {
      const response = await claude.generateCode(prompt, context);
      return NextResponse.json({ response });
    }

    // Streaming mode
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

    // Default chat mode
    const response = await claude.chat({
      messages: [{ role: 'user', content: prompt }],
    });

    return NextResponse.json({ response });
  } catch (error) {
    logger.error('Claude API error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
