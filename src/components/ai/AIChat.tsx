'use client';

import { Send, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PricingModal } from '@/components/pricing/PricingModal';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { logger } from '@/lib/logger';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIUsage {
  requests_today: number;
  limit: number;
  remaining: number;
}

export function AIChat({ userId, userTier }: { userId: string; userTier: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<AIUsage | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [rateLimitHit, setRateLimitHit] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userId,
        }),
      });

      if (response.status === 429) {
        // Rate limit exceeded
        const data = await response.json();
        setRateLimitHit(true);
        setShowPricingModal(true);

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ You've reached your daily limit of ${data.limit} AI requests. Upgrade to continue!`,
          },
        ]);

        return;
      }

      if (!response.ok) {
        throw new Error('AI request failed');
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.content,
        },
      ]);

      setUsage(data.usage);
    } catch (error) {
      logger.error('AI Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '❌ Sorry, something went wrong. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <GlassCard className="flex-1 p-6 flex flex-col">
        {/* Header with usage indicator */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold">AI Assistant</h2>
          </div>

          {usage && (
            <div className="text-sm text-zinc-400">
              {usage.remaining}/{usage.limit} requests left today
              {usage.remaining <= 3 && <span className="ml-2 text-yellow-400">⚠️ Low quota</span>}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[300px]">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-zinc-500">
              Ask me anything about crypto, trading, or market analysis...
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user' ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-100'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 p-3 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 bg-zinc-800 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-400 text-white"
            disabled={loading || rateLimitHit}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim() || rateLimitHit}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </GlassCard>

      {/* Pricing Modal - Auto show on 429 */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        userId={userId}
        currentTier={userTier}
        trigger="rate_limit"
      />
    </div>
  );
}
