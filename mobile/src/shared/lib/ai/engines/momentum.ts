export async function runMomentumStrategy(prices: number[]) {
  // Simple RSI + Trend Logic
  if (prices.length < 14) return { signal: 'NEUTRAL', confidence: 0 };

  const currentPrice = prices[prices.length - 1];
  const prevPrice = prices[prices.length - 2];
  
  // Mock RSI Calculation (Simplified)
  const gains = [];
  const losses = [];
  for(let i=1; i<14; i++) {
      const change = prices[prices.length-i] - prices[prices.length-i-1];
      if(change > 0) gains.push(change);
      else losses.push(Math.abs(change));
  }
  
  const avgGain = gains.reduce((a,b)=>a+b, 0) / 14;
  const avgLoss = losses.reduce((a,b)=>a+b, 0) / 14;
  const rs = avgGain / (avgLoss || 1);
  const rsi = 100 - (100 / (1 + rs));

  if (rsi > 70) return { signal: 'SELL', confidence: 80, reason: 'Overbought RSI > 70' };
  if (rsi < 30) return { signal: 'BUY', confidence: 80, reason: 'Oversold RSI < 30' };
  
  // Trend check
  if (currentPrice > prevPrice) return { signal: 'BUY', confidence: 50, reason: 'Uptrend' };
  
  return { signal: 'NEUTRAL', confidence: 0 };
}
