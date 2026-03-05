import { MemoryEntry, MemoryCategory, createMemoryEntry } from './agent-memory-entry-types';
import { SensoryMemoryCompressor } from './sensory-memory-compressor';
import { ShortTermMemoryStore } from './short-term-memory-store';
import { LongTermMemoryConsolidator } from './long-term-memory-consolidator';
import { MemoryRelevanceScorer } from './memory-relevance-scorer';
import { Logger } from '../utils/logger';

const logger = new Logger('AgentMemoryService');

const CONSOLIDATION_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const LONG_TERM_MAX_ENTRIES = 1000;

export class AgentMemoryService {
  private compressor = new SensoryMemoryCompressor();
  private shortTermStore = new ShortTermMemoryStore();
  private consolidator = new LongTermMemoryConsolidator();
  private scorer = new MemoryRelevanceScorer();
  private longTermStore: MemoryEntry[] = [];
  private consolidationTimer: ReturnType<typeof setInterval> | null = null;

  // Add memory through 3-tier pipeline (LightMem flow)
  addMemory(params: {
    agentId: string;
    sessionId: string;
    content: string;
    category: MemoryCategory;
    metadata?: Record<string, unknown>;
  }): MemoryEntry {
    // Tier 1: Sensory — compress + segment
    const compressed = this.compressor.compress(params.content);
    const topic = this.compressor.detectTopic(params.content);
    const facts = this.compressor.extractFacts(params.content);

    const entry = createMemoryEntry({
      agentId: params.agentId,
      sessionId: params.sessionId,
      content: params.content,
      category: params.category,
      topic,
      metadata: params.metadata,
    });

    entry.compressedContent = compressed;
    entry.extractedFacts = facts;
    entry.tier = 'short-term';

    // Tier 2: Short-term — store in memory
    this.shortTermStore.add(entry);

    logger.debug(`Memory added: ${entry.id} [${topic}] for agent ${params.agentId}`);
    return entry;
  }

  // Search across both short-term and long-term stores
  search(agentId: string, query: string, limit = 5): MemoryEntry[] {
    const shortTermResults = this.shortTermStore.search(agentId, query, limit);

    // Also search long-term
    const queryLower = query.toLowerCase();
    const longTermResults = this.longTermStore
      .filter(e => e.agentId === agentId && (
        e.content.toLowerCase().includes(queryLower) ||
        e.topic.toLowerCase().includes(queryLower) ||
        e.extractedFacts.some(f => f.toLowerCase().includes(queryLower))
      ))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    // Merge and dedupe by id
    const seen = new Set<string>();
    const combined = [...shortTermResults, ...longTermResults].filter(e => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });

    return this.scorer.scoreAll(combined).slice(0, limit);
  }

  // Get session summary for an agent
  getSessionSummary(agentId: string, sessionId: string): {
    totalMemories: number;
    topics: string[];
    topFacts: string[];
  } {
    const entries = this.shortTermStore
      .getByAgent(agentId)
      .filter(e => e.sessionId === sessionId);

    const topics = [...new Set(entries.map(e => e.topic))];
    const topFacts = [...new Set(entries.flatMap(e => e.extractedFacts))].slice(0, 10);

    return { totalMemories: entries.length, topics, topFacts };
  }

  // Start background consolidation worker (LightMem sleep-time)
  startConsolidation(): void {
    if (this.consolidationTimer) return;

    this.consolidationTimer = setInterval(() => {
      this.runConsolidation();
    }, CONSOLIDATION_INTERVAL_MS);

    logger.info(`Consolidation worker started (interval: ${CONSOLIDATION_INTERVAL_MS / 1000}s)`);
  }

  stopConsolidation(): void {
    if (this.consolidationTimer) {
      clearInterval(this.consolidationTimer);
      this.consolidationTimer = null;
      logger.info('Consolidation worker stopped');
    }
  }

  getStats() {
    return {
      shortTerm: this.shortTermStore.getStats(),
      longTermCount: this.longTermStore.length,
      consolidationActive: this.consolidationTimer !== null,
    };
  }

  private runConsolidation(): void {
    const allEntries = this.shortTermStore.getAllEntries();
    if (allEntries.length === 0) return;

    const { kept, merged, pruned } = this.consolidator.consolidate(allEntries);

    // Move long-term promoted entries into long-term store
    const promoted = kept.filter(e => e.tier === 'long-term');
    this.longTermStore.push(...promoted);

    // Trim long-term store by relevance score
    if (this.longTermStore.length > LONG_TERM_MAX_ENTRIES) {
      this.scorer.scoreAll(this.longTermStore);
      this.longTermStore = this.longTermStore.slice(0, LONG_TERM_MAX_ENTRIES);
    }

    if (merged > 0 || pruned > 0) {
      logger.info(`Consolidation complete: merged=${merged}, pruned=${pruned}, longTerm=${this.longTermStore.length}`);
    }
  }
}
