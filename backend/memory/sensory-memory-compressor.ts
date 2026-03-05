import { Logger } from '../utils/logger';

const logger = new Logger('SensoryMemoryCompressor');

// LightMem-inspired: compress text by removing low-information tokens
// and segment into topics
export class SensoryMemoryCompressor {

  // Compress by removing filler words, redundant phrases, normalizing
  compress(text: string): string {
    // Step 1: Remove common filler phrases
    const fillers = [
      /\b(basically|actually|essentially|literally|obviously|clearly|you know|i mean|sort of|kind of)\b/gi,
      /\b(in order to|for the purpose of|with respect to|in regard to)\b/gi,
      /\b(it is worth noting that|it should be noted that|as a matter of fact)\b/gi,
    ];
    let compressed = text;
    for (const filler of fillers) {
      compressed = compressed.replace(filler, '');
    }

    // Step 2: Normalize whitespace
    compressed = compressed.replace(/\s+/g, ' ').trim();

    // Step 3: Remove duplicate sentences
    const sentences = compressed.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const uniqueSentences = [...new Set(sentences.map(s => s.trim().toLowerCase()))];
    const deduped = uniqueSentences.map(s => {
      const original = sentences.find(orig => orig.trim().toLowerCase() === s);
      return original?.trim() || s;
    });
    compressed = deduped.join('. ');
    if (compressed && !compressed.endsWith('.')) compressed += '.';

    const ratio = text.length > 0 ? ((1 - compressed.length / text.length) * 100).toFixed(1) : '0';
    logger.debug(`Compressed: ${text.length} → ${compressed.length} chars (${ratio}% reduction)`);

    return compressed;
  }

  // Detect topic from text content (LightMem topic segmentation)
  detectTopic(text: string): string {
    const topicKeywords: Record<string, string[]> = {
      'trade-execution': ['buy', 'sell', 'order', 'execute', 'fill', 'position', 'close'],
      'risk-management': ['risk', 'stop-loss', 'take-profit', 'drawdown', 'exposure', 'margin', 'liquidation'],
      'market-analysis': ['trend', 'bullish', 'bearish', 'support', 'resistance', 'volume', 'momentum'],
      'signal-detection': ['signal', 'rsi', 'macd', 'indicator', 'divergence', 'crossover', 'pattern'],
      'portfolio-management': ['rebalance', 'allocation', 'diversify', 'weight', 'portfolio'],
      'system-operations': ['error', 'timeout', 'restart', 'health', 'latency', 'connection'],
    };

    const lower = text.toLowerCase();
    let bestTopic = 'general';
    let bestScore = 0;

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      const score = keywords.reduce((sum, kw) => sum + (lower.includes(kw) ? 1 : 0), 0);
      if (score > bestScore) {
        bestScore = score;
        bestTopic = topic;
      }
    }

    return bestTopic;
  }

  // Extract key facts (simplified version of LightMem metadata extraction)
  extractFacts(text: string): string[] {
    const facts: string[] = [];

    // Extract numbers with context
    const numberPatterns = /(\w+[\s:=]+[$]?[\d,.]+[%]?)/g;
    const numberMatches = text.match(numberPatterns);
    if (numberMatches) facts.push(...numberMatches.slice(0, 5).map(m => m.trim()));

    // Extract action phrases
    const actionPattern = /(bought|sold|placed|closed|opened|triggered|executed)\s+.{5,60}[.!?,]/gi;
    const actionMatches = text.match(actionPattern);
    if (actionMatches) facts.push(...actionMatches.slice(0, 3).map(m => m.trim()));

    return facts;
  }
}
