export async function runSentimentStrategy(headlines: string[]) {
  // In prod: Call DeepSeek API
  // Mocking sentiment analysis
  
  const positiveKeywords = ['bull', 'surge', 'adoption', 'etf', 'upgrade'];
  const negativeKeywords = ['ban', 'hack', 'crash', 'regulation', 'lawsuit'];
  
  let score = 0;
  headlines.forEach(text => {
      const lower = text.toLowerCase();
      if (positiveKeywords.some(k => lower.includes(k))) score += 1;
      if (negativeKeywords.some(k => lower.includes(k))) score -= 1;
  });
  
  if (score > 2) return { signal: 'BUY', confidence: 85, reason: 'Strong Positive News Sentiment' };
  if (score < -2) return { signal: 'SELL', confidence: 85, reason: 'Strong Negative News Sentiment' };
  
  return { signal: 'NEUTRAL', confidence: 20, reason: 'Mixed Signals' };
}
