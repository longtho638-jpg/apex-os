// Memory entry types inspired by LightMem + Mem0

export type MemoryTier = 'sensory' | 'short-term' | 'long-term';
export type MemoryCategory = 'trade' | 'signal' | 'risk' | 'market' | 'strategy' | 'error';
export type ConsolidationAction = 'ADD' | 'UPDATE' | 'DELETE' | 'NOOP';

export interface MemoryEntry {
  id: string;
  agentId: string;           // Scoping: which agent owns this memory
  sessionId: string;         // Scoping: which session
  tier: MemoryTier;
  category: MemoryCategory;
  content: string;           // The actual memory text
  compressedContent: string; // Compressed version (sensory layer output)
  topic: string;             // Topic label from segmentation
  extractedFacts: string[];  // Key facts extracted
  relevanceScore: number;    // 0-1, multi-factor scoring
  accessCount: number;       // How many times retrieved
  createdAt: number;         // Unix timestamp
  updatedAt: number;
  metadata: Record<string, unknown>;
}

// Factory function to create new MemoryEntry
export function createMemoryEntry(params: {
  agentId: string;
  sessionId: string;
  content: string;
  category: MemoryCategory;
  topic?: string;
  metadata?: Record<string, unknown>;
}): MemoryEntry {
  const now = Date.now();
  return {
    id: `mem_${now}_${Math.random().toString(36).slice(2, 8)}`,
    agentId: params.agentId,
    sessionId: params.sessionId,
    tier: 'sensory',
    category: params.category,
    content: params.content,
    compressedContent: '',
    topic: params.topic || 'general',
    extractedFacts: [],
    relevanceScore: 1.0,
    accessCount: 0,
    createdAt: now,
    updatedAt: now,
    metadata: params.metadata || {},
  };
}
