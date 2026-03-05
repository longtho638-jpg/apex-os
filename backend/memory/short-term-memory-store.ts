import { MemoryEntry } from './agent-memory-entry-types';
import { Logger } from '../utils/logger';

const logger = new Logger('ShortTermMemoryStore');

const MAX_ENTRIES_PER_AGENT = 100;
const MAX_TOTAL_ENTRIES = 500;

export class ShortTermMemoryStore {
  private store = new Map<string, MemoryEntry[]>();
  private totalCount = 0;

  add(entry: MemoryEntry): void {
    const entries = this.store.get(entry.agentId) || [];
    entries.push(entry);

    // Evict oldest if over per-agent limit
    if (entries.length > MAX_ENTRIES_PER_AGENT) {
      const evicted = entries.shift();
      if (evicted) {
        logger.debug(`Evicted oldest entry for agent ${entry.agentId}: ${evicted.id}`);
        this.totalCount--;
      }
    }

    this.store.set(entry.agentId, entries);
    this.totalCount++;

    // Global eviction if needed
    if (this.totalCount > MAX_TOTAL_ENTRIES) {
      this.evictGlobalOldest();
    }
  }

  search(agentId: string, query: string, limit = 5): MemoryEntry[] {
    const entries = this.store.get(agentId) || [];
    const queryLower = query.toLowerCase();

    // Simple keyword + relevance search (no vector DB dependency)
    const scored = entries.map(entry => {
      const contentMatch = entry.content.toLowerCase().includes(queryLower) ? 0.5 : 0;
      const topicMatch = entry.topic.toLowerCase().includes(queryLower) ? 0.3 : 0;
      const factMatch = entry.extractedFacts.some(f => f.toLowerCase().includes(queryLower)) ? 0.2 : 0;
      const searchScore = contentMatch + topicMatch + factMatch + entry.relevanceScore * 0.3;

      // Boost access count on hit
      entry.accessCount++;

      return { entry, searchScore };
    });

    return scored
      .filter(s => s.searchScore > 0)
      .sort((a, b) => b.searchScore - a.searchScore)
      .slice(0, limit)
      .map(s => s.entry);
  }

  getByAgent(agentId: string): MemoryEntry[] {
    return this.store.get(agentId) || [];
  }

  getByTopic(agentId: string, topic: string): MemoryEntry[] {
    return (this.store.get(agentId) || []).filter(e => e.topic === topic);
  }

  getAllEntries(): MemoryEntry[] {
    const all: MemoryEntry[] = [];
    for (const entries of this.store.values()) {
      all.push(...entries);
    }
    return all;
  }

  getStats(): { agentCount: number; totalEntries: number; topicDistribution: Record<string, number> } {
    const topicDistribution: Record<string, number> = {};
    for (const entries of this.store.values()) {
      for (const entry of entries) {
        topicDistribution[entry.topic] = (topicDistribution[entry.topic] || 0) + 1;
      }
    }
    return { agentCount: this.store.size, totalEntries: this.totalCount, topicDistribution };
  }

  private evictGlobalOldest(): void {
    let oldestAgent = '';
    let oldestTime = Infinity;

    for (const [agentId, entries] of this.store) {
      if (entries.length > 0 && entries[0].createdAt < oldestTime) {
        oldestTime = entries[0].createdAt;
        oldestAgent = agentId;
      }
    }

    if (oldestAgent) {
      const entries = this.store.get(oldestAgent)!;
      entries.shift();
      this.totalCount--;
      if (entries.length === 0) this.store.delete(oldestAgent);
      logger.debug(`Global eviction from agent ${oldestAgent}`);
    }
  }
}
