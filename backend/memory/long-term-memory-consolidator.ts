import { MemoryEntry, ConsolidationAction } from './agent-memory-entry-types';
import { MemoryRelevanceScorer } from './memory-relevance-scorer';
import { Logger } from '../utils/logger';

const logger = new Logger('LongTermMemoryConsolidator');

const SIMILARITY_MERGE_THRESHOLD = 0.7;
const PRUNING_SCORE_THRESHOLD = 0.1;

export class LongTermMemoryConsolidator {
  private scorer = new MemoryRelevanceScorer();

  // Offline consolidation: merge similar, prune stale (LightMem sleep-time)
  consolidate(entries: MemoryEntry[]): { kept: MemoryEntry[]; merged: number; pruned: number } {
    let merged = 0;
    let pruned = 0;

    // Step 1: Score all entries
    this.scorer.scoreAll(entries);

    // Step 2: Prune low-relevance entries
    const alive = entries.filter(e => {
      if (e.relevanceScore < PRUNING_SCORE_THRESHOLD) {
        pruned++;
        return false;
      }
      return true;
    });

    // Step 3: Merge similar entries (Mem0 consolidation pattern)
    const consolidated: MemoryEntry[] = [];
    const processed = new Set<string>();

    for (const entry of alive) {
      if (processed.has(entry.id)) continue;

      // Find similar entries (same agent, same topic, high text overlap)
      const similar = alive.filter(other =>
        other.id !== entry.id &&
        !processed.has(other.id) &&
        other.agentId === entry.agentId &&
        other.topic === entry.topic &&
        this.textSimilarity(entry.content, other.content) > SIMILARITY_MERGE_THRESHOLD
      );

      if (similar.length > 0) {
        // Merge: keep newest, combine facts
        const allEntries = [entry, ...similar];
        const newest = allEntries.reduce((a, b) => a.updatedAt > b.updatedAt ? a : b);

        const allFacts = new Set<string>();
        for (const e of allEntries) {
          for (const fact of e.extractedFacts) allFacts.add(fact);
        }

        newest.extractedFacts = [...allFacts];
        newest.tier = 'long-term';
        newest.updatedAt = Date.now();
        newest.relevanceScore = Math.max(...allEntries.map(e => e.relevanceScore));

        consolidated.push(newest);
        for (const s of similar) processed.add(s.id);
        merged += similar.length;

        logger.debug(`Merged ${similar.length + 1} entries into ${newest.id} (topic: ${newest.topic})`);
      } else {
        // Promote to long-term if old enough (>1 hour)
        if (Date.now() - entry.createdAt > 60 * 60 * 1000) {
          entry.tier = 'long-term';
        }
        consolidated.push(entry);
      }

      processed.add(entry.id);
    }

    logger.info(`Consolidation: ${entries.length} → ${consolidated.length} entries (merged: ${merged}, pruned: ${pruned})`);

    return { kept: consolidated, merged, pruned };
  }

  // Decide consolidation action (Mem0 pattern)
  decideAction(existing: MemoryEntry, incoming: MemoryEntry): ConsolidationAction {
    if (this.textSimilarity(existing.content, incoming.content) > 0.9) return 'NOOP';
    if (existing.topic === incoming.topic && existing.agentId === incoming.agentId) {
      if (incoming.updatedAt > existing.updatedAt) return 'UPDATE';
    }
    return 'ADD';
  }

  // Simple word-overlap similarity (Jaccard — no embeddings needed)
  private textSimilarity(a: string, b: string): number {
    const wordsA = new Set(a.toLowerCase().split(/\s+/));
    const wordsB = new Set(b.toLowerCase().split(/\s+/));
    const intersection = new Set([...wordsA].filter(w => wordsB.has(w)));
    const union = new Set([...wordsA, ...wordsB]);
    return union.size > 0 ? intersection.size / union.size : 0;
  }
}
