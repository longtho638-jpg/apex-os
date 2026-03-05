import { MemoryEntry } from './agent-memory-entry-types';

// Mem0-inspired: score = 0.5*recency + 0.3*importance + 0.2*frequency
// LightMem-inspired: time-decay for stale entries

const DECAY_HALF_LIFE_MS = 24 * 60 * 60 * 1000; // 1 day

export class MemoryRelevanceScorer {

  score(entry: MemoryEntry): number {
    const recencyScore = this.computeRecency(entry.updatedAt);
    const importanceScore = this.computeImportance(entry);
    const frequencyScore = this.computeFrequency(entry.accessCount);

    return 0.5 * recencyScore + 0.3 * importanceScore + 0.2 * frequencyScore;
  }

  scoreAll(entries: MemoryEntry[]): MemoryEntry[] {
    for (const entry of entries) {
      entry.relevanceScore = this.score(entry);
    }
    return entries.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // Exponential time-decay (LightMem sleep-time concept)
  private computeRecency(updatedAt: number): number {
    const age = Date.now() - updatedAt;
    return Math.exp(-0.693 * age / DECAY_HALF_LIFE_MS); // ln(2) ≈ 0.693
  }

  // Higher importance for trade/risk/signal categories
  private computeImportance(entry: MemoryEntry): number {
    const categoryWeights: Record<string, number> = {
      'trade': 0.9,
      'risk': 0.95,
      'signal': 0.8,
      'market': 0.6,
      'strategy': 0.7,
      'error': 0.85,
    };
    return categoryWeights[entry.category] ?? 0.5;
  }

  // Log-normalized access frequency
  private computeFrequency(accessCount: number): number {
    return Math.min(1, Math.log2(accessCount + 1) / 5);
  }
}
